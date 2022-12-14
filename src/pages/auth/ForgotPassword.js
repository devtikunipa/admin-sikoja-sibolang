import React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Alert from '@mui/material/Alert';
import APIAUTH from '../../services/auth/Login';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

const ForgotPassword = () => {

    const initialUser = {
        email: '',
    }

    const [data, setData] = React.useState(initialUser);
    const [alert, setAlert] = React.useState(false);
    const [severity, setSeverity] = React.useState('success');
    const [message, setMessage] = React.useState('Cek email anda, link reset password telah dikirimkan!');
    const [openBackdrop, setOpenBackdrop] = React.useState(false);

    const handleOnChange = (event) => {
        let { name, value } = event.target;
        setData({ ...data, [name]: value });
        setAlert(false);
    }
    const handleSubmit = (event) => {
        event.preventDefault();
        setOpenBackdrop(true)
        APIAUTH.ForgotPassword(data).then(() => {
            localStorage.setItem('email', data.email)
            setAlert(true)
            setSeverity('success')
            setMessage('Link reset password telah dikirim ke email anda!')
            setOpenBackdrop(false)
        }).catch(() => {
            setAlert(true)
            setSeverity('error')
            setMessage('Gagal mengirim email verifikasi, silahkan masukkan kembali email anda!')
            setOpenBackdrop(false)
        })
    }
    return (
        <Card elevation={4} sx={{
            marginTop: 20,
            justifyContent: 'center',
            textAlign: 'center',
        }}>
            <Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={openBackdrop}
                onClick={() => setOpenBackdrop(true)}
            >
                <CircularProgress color="inherit" />
            </Backdrop>
            <CardContent>
                <Avatar sx={{ m: 1, bgcolor: 'secondary.main', mx: 'auto', mb: 2 }}>
                    <LockOutlinedIcon />
                </Avatar>
                <Typography component="h1" variant="h5" fontWeight={600} gutterBottom>
                    Anda Lupa Password?
                </Typography>
                <Typography variant="subtitle1" color='text.secondary'>
                    Masukkan email yang terdaftar di akun anda!
                </Typography>
                <Alert severity={severity} sx={{ mt: 2, display: `${alert ? 'flex' : 'none'}` }} >{message}</Alert>
                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        name="email"
                        label="Email"
                        autoComplete="email"
                        type='email'
                        autoFocus
                        onChange={handleOnChange}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                    >
                        Kirim Link Reset Password
                    </Button>
                </Box>
                <Box>
                    <Link href="/login" underline='none' variant="body2">
                        login?
                    </Link>
                </Box>
            </CardContent>
        </Card>
    )
}

export default ForgotPassword