import {
	Button,
	FormControl,
	FormHelperText,
	InputLabel,
	MenuItem,
	Select,
	Stack,
	TextField,
	Typography,
} from '@mui/material';
import moment from 'moment';
import { GetServerSideProps, NextPage } from 'next';
import { FormEvent, useState } from 'react';
import { formToObject, prisma, redirectWithQuery } from 'utils';
import * as yup from 'yup';

type Props = {
	idConteiner: string;
	numero: string;
};

type Fields = {
	tipo:
		| 'Embarque'
		| 'Descarga'
		| 'Gate In'
		| 'Gate Out'
		| 'Reposicionamento'
		| 'Pesagem'
		| 'Scanner';
	dataHoraInicio: string;
	dataHoraFim?: string;
};

const tipos = [
	'Embarque',
	'Descarga',
	'Gate In',
	'Gate Out',
	'Reposicionamento',
	'Pesagem',
	'Scanner',
];

const schema = yup.object().shape({
	tipo: yup
		.string()
		.required('O tipo é obrigatório')
		.test('validate-test', 'O tipo é inválido', async (value) => {
			return tipos.includes(value || '');
		}),
	dataHoraInicio: yup.string().required('A data de início é obrigatória'),
	dataHoraFim: yup
		.string()
		.test(
			'validate-date-end',
			'A data final é inválida',
			async function (value) {
				if (value === '' || !value) return true;
				const dataHoraInicio = moment(this.parent.dataHoraInicio);
				const dataHoraFim = moment(value);
				return dataHoraFim.isAfter(dataHoraInicio);
			}
		),
});

const Criar: NextPage<Props> = ({ idConteiner, numero }) => {
	const [startDate, setStartDate] = useState(
		moment().format('yyyy-MM-DDTHH:mm')
	);
	const [endDate, setEndDate] = useState('');
	const [errors, setErrors] = useState<Fields | any>({});
	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		setErrors({});
		e.preventDefault();
		const body = formToObject<Fields>(e.target);
		try {
			await schema.validate(body, { abortEarly: false });
			window.location.replace(
				`?idConteiner=${idConteiner}&numero=${encodeURI(
					numero
				)}&${redirectWithQuery(body)}`
			);
		} catch (err) {
			const errors: any = {};
			if (err instanceof yup.ValidationError) {
				err.inner.forEach((e) => {
					if (!errors[e.path!]) {
						errors[e.path!] = e.errors[0];
					}
				});
			}
			setErrors(errors);
		}
	};
	return (
		<Stack
			onSubmit={handleSubmit}
			px={4}
			alignItems="center"
			justifyContent="center"
			component="main"
		>
			<Typography variant="h5" component="h1">
				Criar uma movimentação
			</Typography>
			<Typography margin="0 0 1rem" variant="subtitle1" component="h2">
				Contêiner {numero}
			</Typography>
			<Stack
				onSubmit={handleSubmit}
				spacing={2}
				width="100%"
				maxWidth="500px"
				component="form"
			>
				<FormControl error={!!errors.tipo} component="fieldset">
					<InputLabel>Tipo de movimentação</InputLabel>
					<Select
						defaultValue={tipos[0]}
						error={!!errors.tipo}
						labelId="Tipo de movimentação"
						label="Tipo de movimentação"
						name="tipo"
					>
						{tipos.map((tipo) => {
							return (
								<MenuItem key={tipo} value={tipo}>
									{tipo}
								</MenuItem>
							);
						})}
					</Select>
					{errors.tipo && (
						<FormHelperText color="error">{errors.tipo}</FormHelperText>
					)}
				</FormControl>
				<FormControl error={!!errors.dataHoraInicio} component="fieldset">
					<TextField
						value={startDate}
						onChange={(e) =>
							setStartDate(moment(e.target.value).format('yyyy-MM-DDTHH:mm'))
						}
						error={!!errors.dataHoraInicio}
						name="dataHoraInicio"
						variant="outlined"
						label="Data inicial"
						type="datetime-local"
						InputLabelProps={{ shrink: true }}
					/>
					{errors.dataHoraInicio && (
						<FormHelperText color="error">
							{errors.dataHoraInicio}
						</FormHelperText>
					)}
				</FormControl>
				<FormControl error={!!errors.dataHoraFim} component="fieldset">
					<TextField
						value={endDate}
						onChange={(e) =>
							setEndDate(moment(e.target.value).format('yyyy-MM-DDTHH:mm'))
						}
						inputProps={{ min: moment(startDate).format('yyyy-MM-DDTHH:mm') }}
						error={!!errors.dataHoraFim}
						name="dataHoraFim"
						variant="outlined"
						label="Data final"
						type="datetime-local"
						InputLabelProps={{ shrink: true }}
					/>
					{errors.dataHoraFim && (
						<FormHelperText color="error">{errors.dataHoraFim}</FormHelperText>
					)}
				</FormControl>
				<Button sx={{ margin: '1rem 0' }} type="submit" variant="contained">
					Criar
				</Button>
			</Stack>
		</Stack>
	);
};

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
	const { idConteiner, tipo, dataHoraInicio, dataHoraFim } = query as any;
	if (idConteiner && tipo && dataHoraInicio) {
		try {
			await schema.validate(query);
			const conteiner = await prisma.conteiner.findUnique({
				where: {
					id: idConteiner,
				},
			});
			prisma.$disconnect;
			if (!conteiner) throw new Error('Conteiner não existe');
			await prisma.conteiner.update({
				data: {
					movimentacao: {
						create: {
							dataHoraInicio: moment(dataHoraInicio).toISOString(),
							dataHoraFim: dataHoraFim
								? moment(dataHoraFim).toISOString()
								: null,
							tipo,
						},
					},
				},
				where: {
					id: idConteiner,
				},
			});
			prisma.$disconnect;
			return {
				redirect: {
					permanent: false,
					destination: `/movimentacao?cnpj=${conteiner.cnpj}`,
				},
			};
		} catch (err) {
			prisma.$disconnect;
			return {
				redirect: {
					permanent: false,
					destination: `/movimentacao`,
				},
			};
		}
	}
	if (idConteiner) {
		const conteiner = await prisma.conteiner.findUnique({
			where: {
				id: idConteiner,
			},
			include: {
				movimentacao: true,
			},
		});
		prisma.$disconnect;
		if (conteiner?.movimentacao) {
			return {
				redirect: {
					permanent: false,
					destination: `/movimentacao`,
				},
			};
		}
		if (conteiner) {
			return {
				props: {
					idConteiner,
					numero: conteiner.numero,
				},
			};
		}
	}
	if (Object.keys(query).length > 0) {
		return {
			redirect: {
				permanent: false,
				destination: `/movimentacao`,
			},
		};
	}
	return {
		props: {},
	};
};

export default Criar;
