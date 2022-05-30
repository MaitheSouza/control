import { Autocomplete, Stack, TextField, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { DataGrid, GridActionsCellItem, GridColDef } from '@mui/x-data-grid';
import { randomUUID } from 'crypto';
import moment from 'moment';
import { GetServerSideProps, NextPage } from 'next';
import { useState } from 'react';
import { AiFillDelete, AiFillEdit } from 'react-icons/ai';
import { prisma } from 'utils';

type Movimentacao = {
	id: string;
	numero: string;
	movimentacao: {
		id: string;
		tipo: string;
		dataHoraFim: Date | null | string;
		dataHoraInicio: Date | string;
	};
};

type Props = {
	cnpjs: string[];
	cnpjSelected: string | null;
	movimentacoes: Movimentacao[];
};

const Index: NextPage<Props> = ({
	cnpjSelected = '',
	cnpjs,
	movimentacoes,
}) => {
	const [cnpj, setCnpj] = useState(cnpjSelected);
	const columns: GridColDef[] & any = [
		{ field: 'numero', headerName: 'Número', width: 160 },
		{
			field: 'tipo',
			headerName: 'Tipo',
			width: 140,
			valueGetter: ({ row: { movimentacao } }: any) => movimentacao.tipo,
		},
		{
			field: 'dataHoraInicio',
			headerName: 'Data inicial',
			width: 140,
			valueGetter: ({ row: { movimentacao } }: any) =>
				moment(movimentacao.dataHoraInicio).format('DD/MM/yyyy HH:mm'),
		},
		{
			field: 'dataHoraFim',
			headerName: 'Data final',
			width: 140,
			valueGetter: ({ row: { movimentacao } }: any) =>
				movimentacao.dataHoraFim
					? moment(movimentacao.dataHoraFim).format('DD/MM/yyyy HH:mm')
					: 'Não registrado',
		},
		{
			field: 'actions',
			type: 'actions',
			width: 80,
			getActions: ({ row: { movimentacao } }: any) => [
				<GridActionsCellItem
					icon={<AiFillEdit size={18} cursor="pointer" />}
					key={Math.random() * 1000}
					label="Atualizar"
					onClick={(e) => {
						window.location.replace(
							`/movimentacao/atualizar?id=${movimentacao.id}`
						);
					}}
				/>,
				<GridActionsCellItem
					icon={<AiFillDelete size={18} cursor="pointer" />}
					key={Math.random() * 1000}
					label="Deletar"
					onClick={(e) => {
						window.location.replace(
							`/movimentacao/deletar?id=${movimentacao.id}&cnpj=${cnpj}`
						);
					}}
				/>,
			],
		},
	];
	return (
		<Stack width="100%" px={4} alignItems="center" component="main">
			<Stack
				py={4}
				width="100%"
				maxWidth="280px"
				alignSelf="flex-start"
				justifySelf="flex-start"
			>
				<Autocomplete
					fullWidth
					value={cnpj}
					onChange={(e, cnpj) =>
						window.location.replace(
							`?cnpj=${encodeURI(cnpj?.replace(/[^0-9]/g, '') ?? '')}`
						)
					}
					options={cnpjs}
					getOptionLabel={(cnpj) => cnpj}
					renderOption={(props, cnpj) => {
						return (
							<Box component="li" {...props}>
								{cnpj}
							</Box>
						);
					}}
					renderInput={(params) => {
						return (
							<TextField
								{...params}
								name="cnpj"
								label="Digite ou adicione um CNPJ"
								inputProps={{ ...params.inputProps, maxLength: 14 }}
							/>
						);
					}}
				/>
			</Stack>
			<Stack width="100%" alignSelf="flex-start" justifySelf="flex-start">
				{movimentacoes.length === 0 && cnpjSelected && (
					<Typography variant="h5" component="span">
						Não existe nenhuma movimentação para o CNPJ {cnpjSelected}
					</Typography>
				)}
			</Stack>
			<Stack width="80%">
				<Box height="380px" width="100%">
					{movimentacoes.length > 0 && (
						<DataGrid
							disableSelectionOnClick
							rows={movimentacoes}
							columns={columns}
							pageSize={5}
							rowsPerPageOptions={[5]}
						/>
					)}
				</Box>
			</Stack>
		</Stack>
	);
};

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
	const { cnpj } = query as any;
	let movimentacoes: Movimentacao & any = [];
	if (cnpj && cnpj.length === 14) {
		movimentacoes = await prisma.conteiner.findMany({
			select: {
				numero: true,
				movimentacao: {
					select: {
						id: true,
						dataHoraFim: true,
						dataHoraInicio: true,
						tipo: true,
					},
				},
			},
			where: {
				cnpj,
				movimentacao: {
					isNot: null,
				},
			},
		});
		prisma.$disconnect;
	}
	(movimentacoes as Movimentacao[]).forEach((movimentacao, index) => {
		movimentacoes[index].id = randomUUID();
		if (movimentacoes[index].movimentacao?.dataHoraInicio) {
			movimentacoes[index].movimentacao!.dataHoraInicio = moment(
				movimentacoes[index].movimentacao?.dataHoraInicio
			).toISOString() as any;
		}
		if (movimentacoes[index].movimentacao?.dataHoraFim) {
			movimentacoes[index].movimentacao!.dataHoraFim = moment(
				movimentacoes[index].movimentacao?.dataHoraFim
			).toISOString() as any;
		}
	});
	const cnpjs = (
		await prisma.conteiner.findMany({
			select: {
				cnpj: true,
			},
			distinct: ['cnpj'],
			where: {
				movimentacao: {
					isNot: null,
				},
			},
		})
	).map((obj) => obj.cnpj);
	return {
		props: {
			cnpjs,
			cnpjSelected: cnpj || null,
			movimentacoes,
		},
	};
};

export default Index;
