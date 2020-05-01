import React, {Component} from 'react';
import {
  Animated,
  BackHandler,
  Dimensions,
  Easing,
  Keyboard,
  PanResponder,
  TouchableOpacity,
  View,
} from 'react-native';
import PropTypes from 'prop-types';

class SliderPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      animatedValue: new Animated.Value(0),
      isPanelVisible: props.isOpen,
      isPanelOpened: props.isOpen,
      contentHeight: null,
    };
    this._setResponders();
  }

  togglePanel = () => {
    const {contentHeight, animatedValue, isPanelOpened} = this.state;
    const {
      animationDuration,
      animation,
      sliderMinHeight,
      onOpen,
      onClose,
    } = this.props;

    const toValue =
      animatedValue._value === 0 ? contentHeight - sliderMinHeight : 0;
    Animated.timing(animatedValue, {
      duration: animationDuration,
      easing: animation,
      toValue,
      useNativeDriver: false,
    }).start(() => {
      this.setState({isPanelOpened: !toValue}, () => {
        if (!isPanelOpened) {
          onOpen();
        } else {
          onClose();
          Keyboard.dismiss();
        }
      });
    });
  }

  _onBackPress = () => {
    this.state.isPanelOpened && this.togglePanel();
    return this.state.isPanelOpened;
  }

  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', this._onBackPress);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this._onBackPress);
  }

  _setResponders() {
    this._parentPanResponder = PanResponder.create({
      onStartShouldSetResponderCapture: () => false,
      onMoveShouldSetPanResponderCapture: () => !this.state.isPanelOpened,
      onPanResponderRelease: () => this.togglePanel(),
    });

    this._childPanResponder = PanResponder.create({
      onStartShouldSetResponderCapture: () => false,
      onMoveShouldSetPanResponderCapture: (_, gestureState) =>
        gestureState.dy > 15,
      onPanResponderRelease: (_, gestureState) =>
        gestureState.dy > 0 && this.togglePanel(),
    });
  }

  _handleScrollEndDrag = ({nativeEvent}) => {
    nativeEvent.contentOffset.y === 0 && this.togglePanel();
  }

  _setSize = ({nativeEvent}) => {
    this.setState({contentHeight: nativeEvent.layout.height}, () => {
      const {isOpen, sliderMinHeight} = this.props;
      const {animatedValue, contentHeight} = this.state;
      if (!isOpen && contentHeight) {
        animatedValue.setValue(contentHeight - sliderMinHeight);
        this.setState({isPanelVisible: true});
      }
    });
  }

  render() {
    const {isPanelVisible, animatedValue} = this.state;
    const {
      sliderMaxHeight,
      wrapperStyle,
      outerContentStyle,
      innerContentStyle,
      lineContainerStyle,
      lineStyle,
      children,
    } = this.props;

    return (
      <Animated.View
        onLayout={this._setSize}
        {...this._parentPanResponder.panHandlers}
        style={{
          ...styles.container,
          ...wrapperStyle,
          maxHeight: sliderMaxHeight,
          transform: [
            {translateY: animatedValue},
            {scale: isPanelVisible ? 1 : 0},
          ],
        }}>
        <View
          style={[styles.outerContent, outerContentStyle]}
          {...this._childPanResponder.panHandlers}>
          <TouchableOpacity onPress={this.togglePanel} activeOpacity={1}>
            <View style={[styles.lineContainer, lineContainerStyle]}>
              <View style={[styles.line, lineStyle]} />
            </View>
          </TouchableOpacity>
          <View style={[styles.innerContent, innerContentStyle]}>
            {typeof children === 'function'
              ? children(this._handleScrollEndDrag)
              : children}
          </View>
        </View>
      </Animated.View>
    );
  }
}

SliderPanel.propTypes = {
  children: PropTypes.oneOfType([PropTypes.func, PropTypes.object]).isRequired,
  isOpen: PropTypes.bool,
  sliderMaxHeight: PropTypes.number,
  sliderMinHeight: (props, propName, _) => {
    if (props[propName] > props.sliderMaxHeight) {
      return new Error(
        'sliderMinHeight value cannot be greater than sliderMaxHeight',
      );
    }
  },
  animation: PropTypes.func,
  animationDuration: PropTypes.number,
  onOpen: PropTypes.func,
  onClose: PropTypes.func,
  wrapperStyle: PropTypes.object,
  outerContentStyle: PropTypes.object,
  innerContentStyle: PropTypes.object,
  lineContainerStyle: PropTypes.object,
  lineStyle: PropTypes.object,
};

SliderPanel.defaultProps = {
  children: null,
  isOpen: true,
  sliderMaxHeight: Dimensions.get('window').height * 0.5,
  sliderMinHeight: 50,
  animation: Easing.quad,
  animationDuration: 200,
  onOpen: () => null,
  onClose: () => null,
  wrapperStyle: {},
  outerContentStyle: {},
  innerContentStyle: {},
  lineContainerStyle: {},
  lineStyle: {},
};

const styles = {
  container: {
    flex: 1,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.37,
    shadowRadius: 7.49,
    elevation: 12,
    paddingHorizontal: 21,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    position: 'absolute',
    bottom: 0,
    right: 0,
    left: 0,
    backgroundColor: '#ffffff',
  },
  lineContainer: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  line: {
    width: 35,
    height: 4,
    borderRadius: 2,
    marginTop: 18,
    marginBottom: 30,
    backgroundColor: '#D5DDE0',
  },
  outerContent: {
    flex: -1,
  },
  innerContent: {
    flex: -1,
  },
};

export default SliderPanel;
