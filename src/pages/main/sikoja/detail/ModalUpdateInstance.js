import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import APIGETALL from '../../../../services/main/GetAll';
import Autocomplete from '@mui/material/Autocomplete';
import APIPATCH from '../../../../services/main/Patch';
import LoadingBackDrop from '../../../../components/LoadingBackDrop';
import AlertSnackbar from '../../../../components/AlertSnackbar';


const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: {
        xs: '100%',
        md: '100%',
        lg: 500
    },
    transform: 'translate(-50%, -50%)',
    bgcolor: 'background.paper',
    border: 'none',
    borderRadius: '10px',
    boxShadow: 24,
    p: 4,
};


const ModalUpdateInstance = (props) => {
    const { disId, description, instanceId } = props;
    const [instances, setInstances] = useState([]);
    const [data, setData] = useState({ instance_id: instanceId })
    const [open, setOpen] = useState(false);
    const [openBackdrop, setOpenBackdrop] = useState(false);
    const [message, setMessage] = useState('Pihak Berwenang berhasil diubah!');
    const [status, setStatus] = useState(true);
    const [openSnackbar, setOpenSnackbar] = useState(false);

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    useEffect(() => {
        APIGETALL.Instances().then(result => {
            setInstances(result)
        })
    }, [])

    const handleOnSelected = (event, newValue) => {
        const id = newValue.id;
        setData({ instance_id: id })
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        setOpen(false)
        setOpenBackdrop(true)
        APIPATCH.UpdateDisposition(disId, data).then(() => {
            setStatus(true)
            setOpenSnackbar(true)
            setTimeout(() => {
                window.location.reload()
            }, 1500)
        }).catch(error => {
            setMessage('Gagal menyimpan data, coba lagi!')
            setStatus(false)
            setOpenSnackbar(true)
            setOpenBackdrop(false)
        })
    }

    return (
        <>
            <Button variant='outlined' disabled={description === null ? false : true} onClick={handleOpen}>
                {description === null ? 'Edit' : 'Telah ditindaklanjuti'}
            </Button>
            <LoadingBackDrop open={openBackdrop} onClick={() => setOpenBackdrop(true)} />
            <AlertSnackbar message={message} status={status} opensnackbar={openSnackbar} setOpensnackbar={setOpenSnackbar} />
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
                sx={{ mx: 1 }}
            >
                <Box sx={style} maxWidth='lg'>
                    <Typography id="modal-modal-title" variant="h6" component="h2">
                        Pilih Instansi
                    </Typography>
                    <form onSubmit={handleSubmit}>
                        <FormControl fullWidth>
                            <Autocomplete disablePortal
                                id="instance_id"
                                name='instance_id'
                                options={instances}
                                sx={{ mt: 2 }}
                                getOptionLabel={(instances) => `${instances.instance}`}
                                noOptionsText='Instansi Tidak Ditemukan'
                                renderInput={(params) => <TextField {...params} required label="Nama Instansi" />}
                                onChange={handleOnSelected}
                            />
                        </FormControl>
                        <Button type='submit' variant='contained' sx={{ mt: 2 }}>Simpan</Button>
                    </form>
                </Box>
            </Modal>
        </>
    )
}

export default ModalUpdateInstance