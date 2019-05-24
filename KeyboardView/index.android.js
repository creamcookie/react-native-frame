import React              from "react";
import { Keyboard, View } from "react-native";

export default class KeyboardView extends React.PureComponent {

	constructor(props: P, context: any) {
		super(props, context);
	}

	componentDidMount() {
		this.keyboardDidShowSub = Keyboard.addListener('keyboardDidShow', this.keyboardDidShow);
		this.keyboardDidHideSub = Keyboard.addListener('keyboardDidHide', this.keyboardDidHide);
	}

	componentWillUnmount() {
		this.keyboardDidShowSub.remove();
		this.keyboardDidHideSub.remove();
	}

	keyboardDidShow = (event) => {
		this.props.onKeyboardShow && this.props.onKeyboardShow(true);
		this.setState({ show: true });
	};

	keyboardDidHide = (event) => {
		this.props.onKeyboardHide && this.props.onKeyboardHide(true);
		this.setState({ show: false });
	};


	render() {
		const { style, paddingBottom, ...props } = this.props;
		return (
			<View {...props} style={[{ paddingBottom: paddingBottom ? paddingBottom : 0 }, style]}/>);
	}
}
