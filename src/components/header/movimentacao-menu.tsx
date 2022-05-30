import { Button, Menu, MenuItem } from '@mui/material';
import Link from 'next/link';
import { FC, MouseEvent, useState } from 'react';
import { GrTransaction } from 'react-icons/gr';

const MovimentacaoMenu: FC = () => {
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
				aria-controls={open ? 'movimentacao-menu' : undefined}
				aria-haspopup="true"
				aria-expanded={open ? 'true' : undefined}
				onClick={handleClick}
			>
				<GrTransaction className="svg-white" size={20} /> Movimentação
			</Button>
			<Menu
				anchorEl={anchorEl}
				open={open}
				onClose={handleClose}
				MenuListProps={{
					'aria-labelledby': 'movimentacao-button',
				}}
			>
				<Link href="/movimentacao" passHref>
					<MenuItem onClick={handleClose}>Listar</MenuItem>
				</Link>
			</Menu>
		</li>
	);
};

export default MovimentacaoMenu;
