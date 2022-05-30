import { CssBaseline, ThemeProvider } from '@mui/material';
import { Header } from 'components/header';
import { AppProps } from 'next/app';
import Head from 'next/head';
import { Fragment, useEffect, useState } from 'react';
import 'styles/global.scss';
import { theme } from 'utils';

function MyApp({ Component, pageProps }: AppProps) {
	const [documentoCarregou, setDocumentoCarregou] = useState(false);
	useEffect(() => {
		setDocumentoCarregou(true);
	}, []);
	if (!documentoCarregou) return <Fragment></Fragment>;
	return (
		<Fragment>
			<Head>
				<title>ContrOL</title>
				<meta name="viewport" content="initial-scale=1, width=device-width" />
			</Head>
			<ThemeProvider theme={theme}>
				<Header />
				<CssBaseline />
				<Component {...pageProps} />
			</ThemeProvider>
		</Fragment>
	);
}

export default MyApp;
