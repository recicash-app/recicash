
import { Box, Typography } from '@mui/material'
import Coupon from '/coupon.jpg'
import Recycling from '/recycling-image.jpg'
import RecyclingCenter from '/recycling-center.jpeg'
import GreenSpot from '@shared/assets/shape-bottom-right.svg'

function InfoBox(top, left, img, text, delay, dir) {
	const commonAnimation = {
		animation: "borderMorph 10s ease-in-out infinite alternate",
		boxShadow: "0px 4px 12px rgba(0,0,0,0.25)",
	};

	return (
		<Box display="flex" alignItems="center" position="absolute" top={top} left={left} zIndex={1} width="100%" height="100%">
			{dir === 1 ? (
				<>
					<img src={img} alt={text} style={{ width: '40%', height: '30%', opacity: '0.9', borderRadius: '50%', ...commonAnimation, animationDelay: delay }} />
					<Typography marginLeft={2} fontSize="1.3vw" fontWeight="bold" fontFamily="Poppins" color="#225C22" maxWidth="30vw">
						{text}
					</Typography>
				</>
			) : (
				<>
					<Typography marginRight={2} fontSize="1.3vw" fontWeight="bold" fontFamily="Poppins" color="#225C22" maxWidth="30vw">
						{text}
					</Typography>
					<img src={img} alt={text} style={{ width: '40%', height: '30%', opacity: '0.9', borderRadius: '50%', ...commonAnimation, animationDelay: delay }} />
				</>
			)}
		</Box>
	);
}

function Information() {
	const borderKeyframes = `
		@keyframes borderMorph {
			0%   { border-radius: 50% 50% 50% 50%; }
			25%  { border-radius: 70% 30% 90% 40%; }
			50%  { border-radius: 85% 55% 45% 35%; }
			75%  { border-radius: 60% 40% 30% 70%; }
			100% { border-radius: 50% 50% 50% 50%; }
		}
	`;

	const floatBg = `
		@keyframes floatBg {
			0% { transform: scale(1.0); }
			50% { transform: scale(1.05); }
			100% { transform: scale(1.0); }
		}
	`;

	return (
		<Box sx={{ position: 'fixed', bottom: '0vw', right: '0vw', width: '47vw', zIndex: -1, }}>
			<style>{floatBg}</style>
			<img src={GreenSpot} alt="Green Spot" style={{ width: '100%', display: 'block', position: 'relative', zIndex: 0, animation: "floatBg 10s ease-in-out infinite alternate" }} />
			<style>{borderKeyframes}</style>
			{InfoBox("-24%", "5%", RecyclingCenter, "Veja ecopontos próximos a você!", "0s", 1)}
			{InfoBox("5%", "15%", Recycling, "Aprenda sobre reciclagem!", "2s", 0)}
			{InfoBox("33%", "-5%", Coupon, "Troque pontos por cupons de desconto!", "4s", 1)}
		</Box>
	);
}

export default Information;