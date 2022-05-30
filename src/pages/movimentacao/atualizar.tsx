import {
	Button,
	FormControl,
	FormHelperText,
	InputLabel,
	MenuItem,
	Select,
	Stack,
	TextField,
	Typography
} from '@mui/material';
import { Movimentacao } from '@prisma/client';
import moment from 'moment';
import { GetServerSideProps, NextPage } from 'next';
import { FormEvent, useState } from 'react';
import { formToObject, prisma, redirectWithQuery } from 'utils';
import * as yup from 'yup';

type Props = {
	movimentacao: Movimentacao;
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

const Atualizar: NextPage<Props> = ({ movimentacao }) => {
	const [startDate, setStartDate] = useState(
		moment(movimentacao.dataHoraInicio).format('yyyy-MM-DDTHH:mm')
	);
	const [endDate, setEndDate] = useState(
		movimentacao.dataHoraFim
			? moment(movimentacao.dataHoraFim).format('yyyy-MM-DDTHH:mm')
			: ''
	);
	const [errors, setErrors] = useState<Fields | any>({});
	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		setErrors({});
		e.preventDefault();
		const body = formToObject<Fields>(e.target);
		try {
			await schema.validate(body, { abortEarly: false });
			window.location.replace(
				`?id=${encodeURI(movimentacao.id)}&${redirectWithQuery(body)}`
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
			<Typography margin="1rem 0" variant="subtitle1" component="h2">
				Atualização uma movimentação
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
						defaultValue={movimentacao.tipo}
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
					Atualizar
				</Button>
			</Stack>
		</Stack>
	);
};

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
	const { id, tipo, dataHoraInicio, dataHoraFim } = query as any;
	if (id && tipo && dataHoraInicio) {
		try {
			await schema.validate(query);
			const movimentacao = await prisma.movimentacao.update({
				data: {
					dataHoraInicio: moment(dataHoraInicio).toISOString(),
					dataHoraFim: dataHoraFim ? moment(dataHoraFim).toISOString() : null,
					tipo,
				},
				where: {
					id,
				},
				include: {
					Conteiner: true,
				},
			});
			prisma.$disconnect;
			return {
				redirect: {
					permanent: false,
					destination: `/movimentacao?cnpj=${movimentacao.Conteiner.cnpj}`,
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
	if (id) {
		const movimentacao: any = await prisma.movimentacao.findUnique({
			where: {
				id,
			},
		});
		if (movimentacao?.dataHoraInicio) {
			movimentacao!.dataHoraInicio = moment(
				movimentacao?.dataHoraInicio
			).toISOString() as any;
		}
		if (movimentacao?.dataHoraFim) {
			movimentacao!.dataHoraFim = moment(
				movimentacao?.dataHoraFim
			).toISOString() as any;
		}
		return {
			props: {
				movimentacao,
			},
		};
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
		redirect: {
			permanent: false,
			destination: `/movimentacao`,
		},
	};
};

export default Atualizar;
