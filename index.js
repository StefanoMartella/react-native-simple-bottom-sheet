import React, { useCallback, useEffect, useRef, useState } from 'react';
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
import PropTypes from "prop-types";

function SliderPanel({
  children,
  isOpen,
  sliderMinHeight,
  sliderMaxHeight,
  animation,
  animationDuration,
  onOpen,
  onClose,
  onScrollEndDrag,
  wrapperStyle,
  outerContentStyle,
  innerContentStyle,
  lineContainerStyle,
  lineStyle,
}) {
  const isPanelOpened = useRef(isOpen);
  const animatedValue = useRef(new Animated.Value(0));
  const contentHeight = useRef(null);
  // Used to prevent blink effect when isOpen is false
  const [visible, setVisible] = useState(isOpen);

  const toggleSlider = useCallback(() => {
      const toValue =
        animatedValue.current._value === 0
          ? contentHeight.current - sliderMinHeight
          : 0;
      Animated.timing(animatedValue.current, {
        duration: animationDuration,
        easing: animation,
        toValue,
        useNativeDriver: false,
      }).start(() => {
        isPanelOpened.current = !toValue;
        if (isPanelOpened.current) {
          onOpen();
        } else {
          onClose();
          Keyboard.dismiss();
        }
      });
    },
    [contentHeight, animatedValue],
  );

  useEffect(() => {
    const onBackPress = () => {
      isPanelOpened.current && toggleSlider();
      return isPanelOpened.current;
    };

    BackHandler.addEventListener('hardwareBackPress', onBackPress);

    return () =>
      BackHandler.removeEventListener('hardwareBackPress', onBackPress);
  }, [toggleSlider]);

  const parentPanResponder = PanResponder.create({
    onStartShouldSetResponderCapture: () => false,
    onMoveShouldSetPanResponderCapture: () => !isPanelOpened.current,
    onPanResponderRelease: () => toggleSlider(),
  });

  const childPanResponder = PanResponder.create({
    onStartShouldSetResponderCapture: () => false,
    onMoveShouldSetPanResponderCapture: (_, gestureState) =>
      gestureState.dy > 15,
    onPanResponderRelease: (_, gestureState) =>
      gestureState.dy > 0 && toggleSlider(),
  });

  const handleScrollEndDrag = useCallback((event) => {
      event.nativeEvent.contentOffset.y === 0 && toggleSlider();
        onScrollEndDrag(event); // Custom behaviour
      },
    [toggleSlider],
  );

  const setSize = useCallback(({nativeEvent}) => {
      contentHeight.current = nativeEvent.layout.height;
      if(!isOpen && contentHeight.current) {
        animatedValue.current.setValue(contentHeight.current - sliderMinHeight);
        setVisible(true);
      }
    },
    [contentHeight, visible, setVisible],
  );

  return (
    <Animated.View
      onLayout={setSize}
      {...parentPanResponder.panHandlers}
      style={{
        ...styles.container,
        ...wrapperStyle,
        maxHeight: sliderMaxHeight,
        transform: [
          {translateY: animatedValue.current},
          {scale: visible ? 1: 0},
        ],
      }}>
      <View
        style={[styles.outerContent, outerContentStyle]}
        {...childPanResponder.panHandlers}>
        <TouchableOpacity onPress={toggleSlider} activeOpacity={1}>
          <View style={[styles.lineContainer, lineContainerStyle]}>
            <View style={[styles.line, lineStyle]} />
          </View>
        </TouchableOpacity>
        <View style={[styles.innerContent, innerContentStyle]}>
          {typeof children === 'function'
            ? children(handleScrollEndDrag)
            : children
          }
        </View>
      </View>
    </Animated.View>
  );
}

SliderPanel.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.object
  ]).isRequired,
  isOpen: PropTypes.bool,
  sliderMaxHeight: PropTypes.number,
  sliderMinHeight: (props, propName, _) => {
    if (props[propName] < 50) {
      return new Error('Min value cannot be lower than 50');
    } else if (props[propName] > props.sliderMaxHeight) {
      return new Error(
        'sliderMinHeight value cannot be greater than sliderMaxHeight');
    }
  },
  animation: PropTypes.func,
  animationDuration: PropTypes.number,
  onOpen: PropTypes.func,
  onClose: PropTypes.func,
  onScrollEndDrag: PropTypes.func,
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
  onScrollEndDrag: () => null,
  wrapperStyle: {},
  outerContentStyle: {},
  innerContentStyle: {},
  lineContainerStyle: {},
  lineStyle: {},
}

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
