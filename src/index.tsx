import { BrowserRouter } from 'react-router-dom';
import React, { FC } from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import { store } from '@store';
import { Provider } from 'react-redux';
import {
  createTheme, ThemeProvider,
  Theme, StyledEngineProvider
} from '@mui/material/styles';
import { SnackbarProvider } from 'notistack';
import { SocketIoProvider } from '@components/core';
import App from './App';

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
      light: '#3584e4',
      main: '#1B74E4',
      dark: '#056be7',
      contrastText: '#fff'
    },
    secondary: {
      light: '#74937e',
      main: '#547560',
      dark: '#3f5446',
      contrastText: '#fff'
    },
    info: {
      main: '#E4E6EB'
    },
    success: {
      main: '#4AC99B'
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
    h1: { color: '#1B1F3B' },
    h2: { color: '#1B1F3B' },
    h3: { color: '#1B1F3B' },
    h4: { color: '#1B1F3B' },
    h5: { color: '#1B1F3B' },
    h6: { color: '#1B1F3B' },
    body1: { color: '#1B1F3B' }
  },
  components: {
    MuiDialog: {
      styleOverrides: {
        paper: {
          width: '100%'
        }
      }
    },
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
            <SnackbarProvider
              maxSnack={3}>
              <SocketIoProvider>
                <App />
              </SocketIoProvider>
            </SnackbarProvider>
          </ThemeProvider>
        </StyledEngineProvider>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);
