import * as React from "react";
import { StyleSheet } from "react-native";
import Animated from "react-native-reanimated";
import {
  onGestureEvent,
  preserveOffset,
  runSpring,
  snapPoint
} from "react-native-redash";
import { State, PanGestureHandler } from "react-native-gesture-handler";

const {
  Clock,
  Value,
  useCode,
  set,
  modulo,
  divide,
  diff,
  sub,
  block,
  eq,
  cond,
  floor,
  ceil,
  not,
  clockRunning,
  lessThan,
  stopClock
} = Animated;

interface PanGestureProps {
  index: Animated.Value<number>;
  ratio: number;
  length: number;
}

export default ({ index, ratio, length }: PanGestureProps) => {
  const clock = new Clock();
  const shouldSnap = new Value(0);
  const translationX = new Value(0);
  const velocityX = new Value(0);
  const state = new Value(State.UNDETERMINED);
  const gestureEvent = onGestureEvent({
    translationX,
    velocityX,
    state
  });
  const translateX = preserveOffset(translationX, state);
  const increment = divide(diff(translateX), ratio);
  const setIndex = (value: Animated.Node<number>) =>
    set(index, modulo(value, length));
  useCode(
    block([
      setIndex(sub(index, increment)),
      cond(eq(state, State.BEGAN), stopClock(clock)),
      cond(eq(state, State.END), [
        set(state, State.UNDETERMINED),
        set(shouldSnap, 1)
      ]),
      cond(eq(shouldSnap, 1), [
        setIndex(
          runSpring(
            clock,
            index,
            snapPoint(index, divide(velocityX, -ratio), [
              ceil(index),
              floor(index)
            ])
          )
        ),
        cond(not(clockRunning(clock)), set(shouldSnap, 0))
      ])
    ]),
    []
  );
  return (
    <PanGestureHandler {...gestureEvent}>
      <Animated.View style={StyleSheet.absoluteFill} />
    </PanGestureHandler>
  );
};
