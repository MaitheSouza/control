import { Autocomplete, Box, Stack, TextField, Typography } from '@mui/material';
import { DataGrid, GridActionsCellItem, GridColDef } from '@mui/x-data-grid';
import { Conteiner } from '@prisma/client';
import { GetServerSideProps, NextPage } from 'next';
import { useState } from 'react';
import { AiFillDelete, AiFillEdit } from 'react-icons/ai';
import { prisma } from 'utils';

type Props = {
	cnpjs: string[];
	cnpjSelected: string;
	conteiners: Conteiner[];
};

const Index: NextPage<Props> = ({ cnpjSelected = '', cnpjs, conteiners }) => {
	const [cnpj, setCnpj] = useState(cnpjSelected);
	const columns: GridColDef[] & any = [
		{ field: 'numero', headerName: 'Número', width: 160 },
		{
			field: 'tipo',
			headerName: 'Tipo',
			width: 140,
		},
		{
			field: 'categoria',
			headerName: 'Categoria',
			width: 150,
		},
		{
			field: 'status',
			headerName: 'Status',
			width: 150,
		},
		{
			field: 'actions',
			type: 'actions',
			width: 80,
			getActions: ({ row: { id } }: any) => [
				<GridActionsCellItem
					icon={<AiFillEdit size={18} cursor="pointer" />}
					key={Math.random() * 1000}
					label="Atualizar"
					onClick={(e) => {
						window.location.replace(`/conteiner/atualizar?id=${id}`);
					}}
				/>,
				<GridActionsCellItem
					icon={<AiFillDelete size={18} cursor="pointer" />}
					key={Math.random() * 1000}
					label="Deletar"
					onClick={(e) => {
						window.location.replace(`/conteiner/deletar?id=${id}&cnpj=${cnpj}`);
					}}
				/>,
			],
		},
	];
	return (
		<Stack px={4} alignItems="center" component="main">
			<Stack
				py={4}
				width="100%"
				maxWidth="280px"
				alignSelf="flex-start"
				justifySelf="flex-start"
			>
				<Autocomplete
					value={cnpj}
					onChange={(e, value) =>
						window.location.replace(
							`?cnpj=${value?.replace(/[^0-9]/g, '') ?? ''}`
						)
					}
					fullWidth
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
								label="Digite um CNPJ"
								inputProps={{ ...params.inputProps, maxLength: 14 }}
							/>
						);
					}}
				/>
			</Stack>
			<Stack width="100%" alignSelf="flex-start" justifySelf="flex-start">
				{conteiners.length == 0 && cnpjSelected && (
					<Typography variant="h5" component="span">
						Não existe nenhum conteiner para o CNPJ {cnpjSelected}
					</Typography>
				)}
			</Stack>
			<Stack width="80%">
				<Box height="380px" width="100%">
					{conteiners.length > 0 && (
						<DataGrid
							disableSelectionOnClick
							rows={conteiners}
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
	if (cnpj === '') {
		return {
			redirect: {
				permanent: false,
				destination: '/conteiner',
			},
		};
	}
	let conteiners: Conteiner[] & any = [];
	if (cnpj) {
		conteiners = await prisma.conteiner.findMany({
			select: {
				id: true,
				cnpj: true,
				numero: true,
				tipo: true,
				categoria: true,
				status: true,
			},
			where: {
				cnpj,
				movimentacao: {
					isNot: null,
				},
			},
		});
		await prisma.conteiner.deleteMany({
			where: {
				cnpj,
				movimentacao: {
					is: null,
				},
			},
		});
		prisma.$disconnect;
	}
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
	prisma.$disconnect;
	return {
		props: {
			cnpjs,
			cnpjSelected: cnpj || null,
			conteiners,
		},
	};
};

export default Index;
