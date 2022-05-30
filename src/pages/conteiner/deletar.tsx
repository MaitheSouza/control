import { GetServerSideProps } from 'next';
import { prisma } from 'utils';

const Deletar = () => {};

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
	const { id, cnpj } = query as any;
	if (id && cnpj) {
		await prisma.conteiner.delete({
			where: {
				id,
			},
		});
		prisma.$disconnect;
		return {
			redirect: {
				permanent: false,
				destination: `/conteiner?cnpj=${cnpj}`,
			},
		};
	}
	return {
		redirect: {
			permanent: false,
			destination: `/conteiner`,
		},
	};
};

export default Deletar;
