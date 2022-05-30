import { GetServerSideProps } from 'next';
import { prisma } from 'utils';

const Deletar = () => {};

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
	const { id, cnpj } = query as any;
	if (id && cnpj) {
		await prisma.movimentacao.delete({
			where: {
				id,
			},
		});
		prisma.$disconnect;
		return {
			redirect: {
				permanent: false,
				destination: `/movimentacao?cnpj=${cnpj}`,
			},
		};
	}
	return {
		redirect: {
			permanent: false,
			destination: `/movimentacao`,
		},
	};
};

export default Deletar;
