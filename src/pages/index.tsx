import { Link, Stack, Typography } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { randomUUID } from 'crypto';
import { GetServerSideProps, NextPage } from 'next';
import NextLink from 'next/link';
import { prisma } from 'utils';

type Movimentacao = {
	id: string;
	cnpj: string;
	total: string;
	embarque: number;
	descarga: number;
	gateIn: number;
	gateOut: number;
	reposicionamento: number;
	pesagem: number;
	scanner: number;
};

type Total = {
	importacao: number;
	exportacao: number;
};

type Props = {
	movimentacoes: Movimentacao[];
	total: Total;
};

const columns: GridColDef[] = [
	{
		field: 'cnpj',
		headerName: 'CNPJ',
		width: 160,
		renderCell: ({ row: { cnpj } }) => {
			return (
				<NextLink passHref href={`/movimentacao?cnpj=${cnpj}`}>
					<Link>{cnpj}</Link>
				</NextLink>
			);
		},
	},
	{ field: 'total', headerName: 'Total' },
	{ field: 'embarque', headerName: 'Embarque' },
	{ field: 'descarga', headerName: 'Descarga' },
	{ field: 'gateIn', headerName: 'Gate In' },
	{ field: 'gateOut', headerName: 'Gate Out' },
	{ field: 'reposicionamento', headerName: 'Reposicionamento', width: 160 },
	{ field: 'pesagem', headerName: 'Pesagem' },
	{ field: 'scanner', headerName: 'Scanner' },
];

const Index: NextPage<Props> = ({ movimentacoes, total }) => {
	return (
		<Stack px={4} alignItems="center" justifyContent="center" component="main">
			<Stack width="80%">
				{movimentacoes.length > 0 && (
					<Stack height="380px" width="100%">
						<DataGrid
							disableSelectionOnClick
							rows={movimentacoes}
							columns={columns}
							pageSize={5}
							rowsPerPageOptions={[5]}
						/>
						<Typography margin="1rem 0" component="span">
							<b>Total de importações:</b> {total.importacao}
						</Typography>
						<Typography component="span">
							<b>Total de exportações:</b> {total.exportacao}
						</Typography>
					</Stack>
				)}
				{movimentacoes.length === 0 && (
					<Typography margin="1rem 0" component="span">
						Não há nenhuma movimentação.
					</Typography>
				)}
			</Stack>
		</Stack>
	);
};

export const getServerSideProps: GetServerSideProps = async () => {
	const movimentacoes: Movimentacao[] =
		await prisma.$queryRaw`SELECT c.cnpj, COUNT(m.tipo) as "total",
	(SELECT COUNT(m1.tipo) FROM "Movimentacao" m1 JOIN "Conteiner" c1 ON c1.id = m1."conteinerId" AND c1.cnpj = c.cnpj AND m1.tipo = 'Embarque') as "embarque",
	(SELECT COUNT(m1.tipo) FROM "Movimentacao" m1 JOIN "Conteiner" c1 ON c1.id = m1."conteinerId" AND c1.cnpj = c.cnpj AND m1.tipo = 'Descarga') as "descarga",
	(SELECT COUNT(m1.tipo) FROM "Movimentacao" m1 JOIN "Conteiner" c1 ON c1.id = m1."conteinerId" AND c1.cnpj = c.cnpj AND m1.tipo = 'Gate In') as "gateIn",
	(SELECT COUNT(m1.tipo) FROM "Movimentacao" m1 JOIN "Conteiner" c1 ON c1.id = m1."conteinerId" AND c1.cnpj = c.cnpj AND m1.tipo = 'Gate Out') as "gateOut",
	(SELECT COUNT(m1.tipo) FROM "Movimentacao" m1 JOIN "Conteiner" c1 ON c1.id = m1."conteinerId" AND c1.cnpj = c.cnpj AND m1.tipo = 'Reposicionamento') as "reposicionamento",
	(SELECT COUNT(m1.tipo) FROM "Movimentacao" m1 JOIN "Conteiner" c1 ON c1.id = m1."conteinerId" AND c1.cnpj = c.cnpj AND m1.tipo = 'Pesagem') as "pesagem",
	(SELECT COUNT(m1.tipo) FROM "Movimentacao" m1 JOIN "Conteiner" c1 ON c1.id = m1."conteinerId" AND c1.cnpj = c.cnpj AND m1.tipo = 'Scanner') as "scanner"
	FROM "Conteiner" c JOIN "Movimentacao" m ON m."conteinerId" = c.id GROUP BY c.cnpj;`;
	const [total] = (await prisma.$queryRaw`SELECT 
		(SELECT COUNT(c1.categoria) FROM "Conteiner" c1 JOIN "Movimentacao" m1 ON c1.id = m1."conteinerId" AND c1.categoria = 'Importação') as "importacao",
		(SELECT COUNT(c1.categoria) FROM "Conteiner" c1 JOIN "Movimentacao" m1 ON c1.id = m1."conteinerId" AND c1.categoria = 'Exportação') as "exportacao"
		FROM "Conteiner" LIMIT 1;`) as Total[];
	prisma.$disconnect;
	movimentacoes.forEach((movimentacao, index) => {
		movimentacoes[index].id = randomUUID();
	});
	return {
		props: {
			movimentacoes: movimentacoes || [],
			total: total || { importacao: 0, exportacao: 0 },
		},
	};
};

export default Index;
