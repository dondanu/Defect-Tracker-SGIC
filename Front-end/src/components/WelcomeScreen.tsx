import React, { useRef } from 'react';
import { View, Text, StyleSheet, PanResponder, SafeAreaView, StatusBar } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Logo from './Logo';

interface WelcomeScreenProps {
	onContinue: () => void;
}

const SWIPE_THRESHOLD = 40; // minimum movement to trigger continue (any direction)

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onContinue }) => {
	const panResponder = useRef(
		PanResponder.create({
			onMoveShouldSetPanResponder: (_, gestureState) => {
				return Math.abs(gestureState.dx) > 10 || Math.abs(gestureState.dy) > 10;
			},
			onPanResponderRelease: (_, gestureState) => {
				if (
					Math.abs(gestureState.dx) >= SWIPE_THRESHOLD ||
					Math.abs(gestureState.dy) >= SWIPE_THRESHOLD
				) {
					onContinue();
				}
			},
		})
	).current;

	return (
		<SafeAreaView style={styles.container} {...panResponder.panHandlers}>
			<StatusBar barStyle="light-content" backgroundColor="#1a237e" />
			<LinearGradient colors={["#1a237e", "#3949ab", "#5c6bc0"]} style={styles.gradient}>
				<View style={styles.centerContent}>
					<Logo size={160} showText={true} showSubtitle={true} />
					<Text style={styles.appName}>SGIC Defect Tracker</Text>
					<Text style={styles.tagline}>Track. Resolve. Deliver.</Text>
				</View>
				{/* Intentionally no CTA text; swipe anywhere to continue */}
			</LinearGradient>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	gradient: {
		flex: 1,
		justifyContent: 'space-between',
	},
	centerContent: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		paddingHorizontal: 24,
	},
	appName: {
		marginTop: 12,
		fontSize: 26,
		fontWeight: 'bold',
		color: '#fff',
		textAlign: 'center',
		textShadowColor: 'rgba(0, 0, 0, 0.3)',
		textShadowOffset: { width: 1, height: 1 },
		textShadowRadius: 2,
	},
	tagline: {
		marginTop: 6,
		fontSize: 14,
		color: 'rgba(255,255,255,0.9)',
		textAlign: 'center',
	},
  
});

export default WelcomeScreen;


