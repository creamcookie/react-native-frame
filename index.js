import React from "react";

import { Platform, View, StyleSheet, ActivityIndicator } from "react-native";
import hoistStatics from "hoist-non-react-statics";

import fetch from "cross-fetch";
import "abortcontroller-polyfill";

import _KeyboardView from "./KeyboardView";

export const KeyboardView = _KeyboardView;
export const Preference = require("./Preference").default;

const createParam = (formData, suffix, object) => {
	if (object === null || object === undefined) {
		formData.append(suffix, "");
	}
	else if (object instanceof Array) {
		object.map((v2, idx) => {
			createParam(formData, suffix + "[" + idx + "]", v2);
		});
	}
	else if (object instanceof Object) {
		Object.keys(object).map((key) => {
			createParam(formData, suffix + "[" + key + "]", object[key]);
		});
	}
	else {
		formData.append(suffix, String(object));
	}
	return formData;
};

const createQuery = (suffix, object) => {
	let formData = "";
	if (object === null || object === undefined) {
		formData += "&" + suffix + "=";
	}
	else if (object instanceof Array) {
		object.map((v2, idx) => {
			formData += createQuery(suffix, v2);
		});
	}
	else if (object instanceof Object) {
		Object.keys(object).map((key) => {
			formData += createQuery(suffix + "[" + key + "]", object[key]);
		});
	}
	else {
		formData += "&" + suffix + "=" + String(object);
	}
	return formData;
};


export const applyCCS = (RootComponent, _config) => {

	const config = Object.assign({
		Accept: "application/json",
		userAgent: `rnccs-frame/unkown ${Platform.OS} 1.0`
	}, _config);

	const extended = class CCSComponent extends React.PureComponent {

		workers = [];

		constructor(props: P, context: any) {
			super(props, context);
			this.rootComponent = React.createRef();
		}

		componentWillUnmount(): void {
			this.workers.map((source) => {
				if (source.timeout) clearTimeout(source.timeout);
				source?.ctrl?.abort();
				source?.reject("Leave a Page");
			});
			this.workers = [];
		}

		onTimeout(source) {
			if (this.workers.indexOf(source) >= 0) {
				this.workers.splice(this.workers.indexOf(source), 1);
				source?.ctrl?.abort();
				source?.reject("Timeout");
			}
		}

		fetch(url, method = "GET", params = {}, unique = false, _config = {}): Promise {
			if (url.indexOf("/") === 0) url = url.substring(1);
			method = method.toLowerCase();

			if (unique) {
				let items = this.workers.filter((item) => item.url == url);
				items.map((source) => {
					if (this.workers.indexOf(source) >= 0) {
						this.workers.splice(this.workers.indexOf(source), 1);
						source?.ctrl?.abort();
						source?.reject("Other Jobs.. ");
					}
				});
			}

			return new Promise((resolve, reject) => {

				const AbortController = window.AbortController;

				let source = { url, resolve, reject, ctrl: new AbortController() };
				if (this.timeout) {
					source.timeout = setTimeout(() => this.onTimeout(source), this.timeout);
				}
				this.workers.push(source);

				let conf = {...config, ..._config};

				try {
					let body = {};
					let headers = {
						...conf.defaultHeaders(),
						"Accept": conf.accept,
						"Content-Type": "application/json",
						"User-Agent": conf.userAgent,
					};

					if (params != null) {
						if (method === "get") {
							let strQuery = "";
							Object.keys(params).forEach((v) => strQuery += createQuery(v, params[v]));
							if (strQuery) url += (url.indexOf("?") === -1 ? "?" : "&") + strQuery.substring(1);
							body = null;
						}
                                                else if (params instanceof FormData) {
                                                        body = params;
                                                        headers["Content-Type"] = "multipart/form-data";
                                                }
						else if (conf.forceJson) {
							body = JSON.stringify(params);
							headers["Content-Type"] = "application/json";
						}
						else if (method == "post") {
							body = new FormData();
							Object.keys(params).forEach((v) => createParam(body, v, params[v]));
							headers["Content-Type"] = "multipart/form-data";
						}
						else {
							if (params instanceof Object) {
								let strQuery = "";
								Object.keys(params).forEach((v) => strQuery += createQuery(v, params[v]));
								if (strQuery) body = strQuery.substring(1);
							}
							else {
								body = String(params);
							}
							headers["Content-Type"] = "application/x-www-form-urlencoded";
						}
					}
					else {
						body = null;
					}

					let final_url = url.indexOf("http") === 0 ? url : conf.host + url;
					fetch(final_url, {
						method,
						headers,
						body,
						credentials: "include",
						signal: source.ctrl.signal
					})
						.then(async (result) => {
							let data = null;
							try {
								data = await result.json();
							}
							catch (e) {
								data = result._bodyText;
							}

							if (this.workers.indexOf(source) >= 0) {
								this.workers.splice(this.workers.indexOf(source), 1);
								if (source.timeout) clearTimeout(source.timeout);
								resolve({ status: result.status, data, headers: result.headers.map });
							}
							this.setState({ progress: null });

						}).catch(e => {
							if (this.workers.indexOf(source) >= 0) {
								this.workers.splice(this.workers.indexOf(source), 1);
								if (source.timeout) clearTimeout(source.timeout);
								reject(e);
								this.setState({ progress: null });
							}
						});
				}
				catch (e) {
					if (this.workers.indexOf(source) >= 0) {
						this.workers.splice(this.workers.indexOf(source), 1);
						if (source.timeout) clearTimeout(source.timeout);
						reject(e);
						this.setState({ progress: null });
					}
				}
			});
		}

		getNode() {
			return this.rootComponent.current;
		}

		showProgress(style = null, render = null) {
			const progress = { style, render };
			this.setState({ progress });
		}

		render() {
			const props = { ...this.props };

			let progressView = null;
			if (this.state?.progress) {
				const progress = this.state?.progress;

				if (typeof(progress?.render) == "function") {
					progressView = progress?.render();
				}
				else {
					const progressStyle = StyleSheet.compose([ StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center', zIndex: 10, } ], progress?.style);
					progressView = (
						<View style={ progressStyle }>
							<ActivityIndicator />
						</View>
					);
				}
			}

			return (
				<>
					<RootComponent
						{...props}
						ref={this.rootComponent}
						fetch={this.fetch.bind(this)}
						showProgress={this.showProgress.bind(this)} />
					{ progressView }
				</>
			);
		}
	}

	return hoistStatics(extended, RootComponent);
};


export default {
	applyCCS: applyCCS,
	Preference: Preference,
	KeyboardView: KeyboardView
};





