import AsyncStorage from "@react-native-community/async-storage";

class Preference {

	data = {};

	constructor() {
	}

	async sync() {
		const keys = await AsyncStorage.getAllKeys();
		const data = await AsyncStorage.multiGet(keys);
		data.map((item) => {
			this.data[item[0]] = item[1];
		});
	}

	getItem(key) {
		return this.data[key];
	}

	async setItem(key, value) {
		let o = {};
		o[key] = value;
		await this.setItems(o);
	}

	async setItems(object) {

		let args = [];
		Object.keys(object).map((key, ix) => {
			args.push([key, object[key]]);
		});

		try {
			await AsyncStorage.multiSet(args);
			args.map((item) => {
				this.data[item[0]] = item[1];
			});
		}
		catch (e) {
		}
	}

	async removeItem(key) {
		await AsyncStorage.removeItem(key);
		delete this.data[key];
	}

	async clearAll() {
		await AsyncStorage.clear();
		this.data = {};
	}
}


export default new Preference();
