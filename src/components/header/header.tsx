import { Button, Stack, Typography } from '@mui/material';
import Link from 'next/link';
import { FC } from 'react';
import { AiFillHome } from 'react-icons/ai';
import ConteinerMenu from './conteiner-menu';
import MovimentacaoMenu from './movimentacao-menu';

const HeaderComponent: FC = () => {
	return (
		<Stack
			alignItems="center"
			justifyContent="space-between"
			bgcolor="primary.main"
			p={4}
			flexWrap="wrap"
			component="header"
			direction="row"
		>
			<Link href="/" passHref>
				<Typography
					width="fit-content"
					fontWeight="bold"
					color="primary.main.contrastText"
					variant="h4"
					component="span"
					sx={{ cursor: 'pointer' }}
				>
					ContrOL
				</Typography>
			</Link>
			<Stack width="fit-content" component="nav" direction="row" spacing={4}>
				<Stack width="fit-content" component="ul" direction="row" spacing={4}>
					<li>
						<Link passHref href="/">
							<Button
								sx={{
									display: 'flex',
									alignItems: 'center',
									gap: '5px',
								}}
							>
								<AiFillHome size={20} /> Página Inicial
							</Button>
						</Link>
					</li>
					<ConteinerMenu />
					<MovimentacaoMenu />
				</Stack>
			</Stack>
		</Stack>
	);
};

export default HeaderComponent;
