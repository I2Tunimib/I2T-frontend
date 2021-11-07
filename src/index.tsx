import { BrowserRouter } from 'react-router-dom';
import React from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import { store } from '@store';
import { Provider } from 'react-redux';
import Loader from '@components/core/Loader';
import {
  createTheme, ThemeProvider,
  Theme, StyledEngineProvider
} from '@mui/material/styles';
import App from './App';
import reportWebVitals from './reportWebVitals';

declare module '@mui/styles/defaultTheme' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {
  }
}

const theme = createTheme({
  palette: {
    common: {
      black: '#283236'
    },
    primary: {
      light: '#4f9ecb',
      main: '#1b7ba7',
      dark: '#0f6588',
      contrastText: '#fff'
    },
    secondary: {
      light: '#74937e',
      main: '#547560',
      dark: '#3f5446',
      contrastText: '#fff'
    },
    text: {
      primary: '#283236',
      secondary: 'rgba(40,50,54,0.6)',
      disabled: 'rgba(40,50,54,0.38)'
    },
    action: {
      disabledBackground: '#eaeef3'
    }
  },
  typography: {
    h1: { color: '#5E514B' },
    h2: { color: '#5E514B' },
    h3: { color: '#5E514B' },
    h4: { color: '#5E514B' },
    h5: { color: '#5E514B' },
    h6: { color: '#5E514B' },
    body1: { color: '#3a3331' }
  },
  components: {
    MuiChip: {
      styleOverrides: {
        root: {
          background: '#eaeef3'
        }
      }
    }
  }
});

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <StyledEngineProvider injectFirst>
          <ThemeProvider theme={theme}>
            <App />
          </ThemeProvider>
        </StyledEngineProvider>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
