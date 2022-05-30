import { Button, Menu, MenuItem } from '@mui/material';
import Link from 'next/link';
import { FC, MouseEvent, useState } from 'react';
import { AiFillContainer } from 'react-icons/ai';

const ConteinerMenu: FC = () => {
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const open = Boolean(anchorEl);
	const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
		setAnchorEl(event.currentTarget);
	};
	const handleClose = () => {
		setAnchorEl(null);
	};
	return (
		<li>
			<Button
				sx={{
					display: 'flex',
					alignItems: 'center',
					gap: '5px',
				}}
				aria-controls={open ? 'conteiner-menu' : undefined}
				aria-haspopup="true"
				aria-expanded={open ? 'true' : undefined}
				onClick={handleClick}
			>
				<AiFillContainer size={20} /> Conteiner
			</Button>
			<Menu
				id="basic-menu"
				anchorEl={anchorEl}
				open={open}
				onClose={handleClose}
				MenuListProps={{
					'aria-labelledby': 'conteiner-button',
				}}
			>
				<Link href="/conteiner" passHref>
					<MenuItem onClick={handleClose}>Listar</MenuItem>
				</Link>
				<Link href="/conteiner/criar" passHref>
					<MenuItem onClick={handleClose}>Criar</MenuItem>
				</Link>
			</Menu>
		</li>
	);
};

export default ConteinerMenu;
