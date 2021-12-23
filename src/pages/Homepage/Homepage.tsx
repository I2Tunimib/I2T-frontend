import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import { Stack, Typography, useMediaQuery } from '@mui/material';
import { MouseEvent, useRef, useState, useEffect, useCallback } from 'react';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { Link } from 'react-router-dom';
import { ReactComponent as Logo } from '../../assets/logo-react.svg';
import screen1 from '../../assets/screen1.png';
import screen2 from '../../assets/screen2.png';
import screen3 from '../../assets/screen3.png';
import screen4 from '../../assets/screen4.png';

const images = [screen1, screen2, screen3, screen4];

const rotate = keyframes`
  0% {
    transform: rotate(0);
  },
  100% {
    transform: rotate(360deg);
  }
`;

const Container = styled.div({
  display: 'flex',
  height: '100vh',
  width: '100%',
  '@media screen and (max-width: 1300px)': {
    flexDirection: 'column',
    height: 'auto',
    overflow: 'auto'
  }
});

const LightSide = styled.div({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  height: '100%',
  width: '60%',
  padding: '40px',
  backgroundColor: '#FFF',
  boxSizing: 'border-box',
  '@media screen and (max-width: 1300px)': {
    width: '100%'
  }
});

const DarkSide = styled.div({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  width: '40%',
  padding: '40px',
  backgroundColor: 'var(--brand-color-one-base)',
  boxSizing: 'border-box',
  '@media screen and (max-width: 1300px)': {
    width: '100%',
    minHeight: '600px'
  }
});

const Dash = styled(Typography)({
  letterSpacing: '-.2em',
  marginRight: '0.3em'
});

const LogoSized = styled(Logo)({
  width: '120px',
  height: '120px',
  animation: `${rotate} 14s linear infinite`
});

const ExploreButton = styled(Link)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: 'auto',
  marginBottom: 'auto',
  height: '40px',
  border: 'none',
  outline: 'none',
  textDecoration: 'none',
  padding: '5px 24px',
  fontSize: '20px',
  fontWeight: 600,
  backgroundColor: '#5efc8d',
  color: '#1B1F3B',
  borderRadius: '7px',
  transition: 'background-color 250ms ease-out',
  '&:hover': {
    backgroundColor: '#4ae478'
  }
});

const Card = styled.div({
  position: 'absolute',
  top: '50%',
  left: '-20%',
  // padding: '24px',
  transform: 'translateY(-50%) perspective(600px)',
  transformStyle: 'preserve-3d',
  transformOrigin: '50% 51%',
  WebkitTransformOrigin: '50%  51%',
  borderRadius: '7px',
  width: '800px',
  height: '400px',
  boxShadow: 'rgb(0 0 0 / 12%) 0px 4px 16px',
  transition: 'transform 250ms ease-out',
  '@media screen and (max-width: 1300px)': {
    left: '5%'
  }
});
const CardContent = styled.div({
  position: 'relative',
  width: '100%',
  height: '100%',
  overflow: 'hidden',
  borderRadius: '7px'
});

const Author = styled(Typography)({
  padding: '10px',
  borderRadius: '7px',
  border: '2px solid #FAFAFA'
});

const Img = styled.img<{ currentIndex: number, index: number }>(({ currentIndex, index }) => ({
  position: 'absolute',
  width: '100%',
  height: '100%',
  top: '0',
  left: '0',
  bottom: '0',
  right: '0',
  opacity: currentIndex === index ? 1 : 0,
  transition: 'opacity 1s linear',
  objectFit: 'fill'
}));

const useMouseMove = () => {
  const getCoords = useCallback((clientX: number = 0, clientY: number = 0) => ({
    clientX,
    clientY
  }), []);

  const coords = useRef(getCoords());

  useEffect(() => {
    const handleMove = (e: any) => {
      coords.current = getCoords(e.clientX, e.clientY);
    };
    window.addEventListener('mousemove', handleMove);
    return () => {
      window.removeEventListener('mousemove', handleMove);
    };
  }, []);
  return coords;
};

const Homepage = () => {
  const [currentIndexImg, setCurrentIndexImg] = useState<number>(0);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useMouseMove();
  const matches = useMediaQuery('max-width: 1300px');

  const computePosition = useCallback(() => {
    if (cardRef.current && trackRef.current) {
      const { top, right, bottom, left, height, width } = cardRef.current.getBoundingClientRect();
      const { clientX, clientY } = trackRef.current;

      const cX = left + width / 2;
      const cY = top + height / 2;

      const x = (((cX - clientX) / cX) * 3);
      const y = (((cY - clientY) / cY) * 3);
      cardRef.current.style.transform = `translateY(-50%) perspective(600px) rotate3d(1, 0, 0, ${y}deg) rotate3d(0, 1, 0, ${x}deg) translateZ(0)`;
    }
  }, [matches]);

  useEffect(() => {
    let aId: any;

    const render = () => {
      aId = requestAnimationFrame(render);
      computePosition();
    };

    const intervalId = setInterval(() => {
      setCurrentIndexImg((previousIndex) => {
        return previousIndex === images.length - 1 ? 0 : previousIndex + 1;
      });
    }, 10000);

    aId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(aId);
      clearInterval(intervalId);
    };
  }, []);

  return (
    <Container>
      <LightSide>
        <Stack>
          <Stack direction="row" alignItems="center" gap="20px">
            <Typography component="span" variant="h1" fontWeight="600">SemTUI</Typography>
            <Dash variant="h1" fontWeight="600">----</Dash>
            <LogoSized />
          </Stack>
          <Typography component="span" variant="h1" fontWeight="600">A framework for</Typography>
          <Typography component="span" variant="h1" fontWeight="600">semantic table</Typography>
          <Typography component="span" variant="h1" fontWeight="600">annotation and</Typography>
          <Typography component="span" variant="h1" fontWeight="600">extension.</Typography>
        </Stack>
        <ExploreButton to="/datasets">
          <Stack component="span" direction="row" alignItems="center" gap="5px">
            Get started
            <ArrowForwardRoundedIcon />
          </Stack>
        </ExploreButton>
      </LightSide>
      <DarkSide>
        <Card ref={cardRef}>
          <CardContent>
            {images.map((img, index) => (
              <Img key={index} src={img} currentIndex={currentIndexImg} index={index} />
            ))}
          </CardContent>
        </Card>
        <Author fontWeight="600" alignSelf="flex-end" marginTop="auto" color="#FAFAFA">by Insid&S Lab</Author>
      </DarkSide>
    </Container>
  );
};

export default Homepage;
