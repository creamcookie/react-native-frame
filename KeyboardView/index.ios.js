import React                   from "react";
import { Animated, Keyboard, } from "react-native";

export default class KeyboardView extends React.PureComponent {

	state = {};

	constructor(props) {
		super(props)
		this.keyboardHeight = new Animated.Value(0);
	}

	componentDidMount() {
		this.keyboardWillShowSub = Keyboard.addListener('keyboardWillShow', this.keyboardWillShow);
		this.keyboardWillHideSub = Keyboard.addListener('keyboardWillHide', this.keyboardWillHide);
		this.keyboardDidShowSub = Keyboard.addListener('keyboardDidShow', this.keyboardDidShow);
		this.keyboardDidHideSub = Keyboard.addListener('keyboardDidHide', this.keyboardDidHide);
	}

	componentWillUnmount() {
		this.keyboardWillShowSub.remove();
		this.keyboardWillHideSub.remove();
		this.keyboardDidShowSub.remove();
		this.keyboardDidHideSub.remove();
	}

	keyboardWillShow = (event) => {
		this.props.onKeyboardShow && this.props.onKeyboardShow(false);
		this.setState({ show: true });
		if (this.animated) {
			this.animated.stop();
			this.animated = null;
		}

		this.animated = Animated.parallel([
			Animated.timing(this.keyboardHeight, {
				duration: event.duration,
				toValue: event.endCoordinates.height,
			})
		]);
		this.animated.start();
	};

	keyboardWillHide = (event) => {
		this.props.onKeyboardHide && this.props.onKeyboardHide(false);

		if (this.animated) {
			this.animated.stop();
			this.animated = null;
		}

		this.animated = Animated.parallel([
			Animated.timing(this.keyboardHeight, {
				duration: event.duration,
				toValue: this.props.paddingBottom ? this.props.paddingBottom : 0,
			})
		]);
		this.animated.start();
	};

	keyboardDidShow = (event) => {
		this.props.onKeyboardShow && this.props.onKeyboardShow(true);
		this.setState({ show: true });
	};

	keyboardDidHide = (event) => {
		this.props.onKeyboardHide && this.props.onKeyboardHide(true);
		this.setState({ show: false });
	};

	render() {
		const { children, style, ...props } = this.props
		return (
			<Animated.View style={[{ paddingBottom: this.keyboardHeight }, style]} {...props}>
				{children}
			</Animated.View>
		);
	}

}
