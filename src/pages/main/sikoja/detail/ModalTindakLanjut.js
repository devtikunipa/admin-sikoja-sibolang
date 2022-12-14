import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import APIPATCH from '../../../../services/main/Patch';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import LoadingBackDrop from '../../../../components/LoadingBackDrop';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import moment from 'moment';
import { Input } from '../../../../components/Moment';
import Stack from '@mui/material/Stack';
import { useDropzone } from 'react-dropzone';
import ReactPlayer from 'react-player';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import { Grid } from '@mui/material';
import APIUPLOAD from '../../../../services/main/upload';
import AlertSnackbar from '../../../../components/AlertSnackbar';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';


const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: {
        xs: '100%',
        md: '100%',
        lg: '50%'
    },
    transform: 'translate(-50%, -50%)',
    bgcolor: 'background.paper',
    border: 'none',
    borderRadius: '10px',
    boxShadow: 24,
    p: 4,
};

const ModalTindakLanjut = (props) => {
    const { disId, description, status, start, estimation, sikojaId, dispFiles, instanceID } = props;
    const initializeDisp = {
        instance_id: instanceID,
        description: description,
        start_date: start ? Input(start) : Input(moment().format()),
        estimation_date: estimation ? Input(estimation) : Input(moment().format()),
    }
    const [anyFiles, setAnyFiles] = useState(dispFiles);
    const [data, setData] = useState(initializeDisp)
    const [open, setOpen] = useState(false);
    const [openBackdrop, setOpenBackdrop] = useState(false);
    const [message, setMessage] = useState('Data telah diupdate!');
    const [codeStatus, setCodeStatus] = useState(true);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [files, setFiles] = useState([]);
    const { getRootProps, isDragActive } = useDropzone({
        onDrop: acceptedFiles => {
            setFiles(acceptedFiles.map(file => Object.assign(file, {
                preview: URL.createObjectURL(file)
            })));
            setAnyFiles(files.length + 1)
        },
        accept: {
            'image/png': ['.png'],
            'image/jpeg': ['.jpg', '.jpeg'],
            'video/mp4': ['.mp4']
        },
        maxFiles: 4,
        maxSize: 10240000,
        minSize: 1,
        noClick: true,
        useFsAccessApi: false,
    });

    const thumbs = files.length !== 0 ? (
        files.map(file => {
            if (file.type == 'video/mp4') {
                return (
                    <ReactPlayer key={file.name} height='100%' width='100%' controls url={file.preview} />
                )
            } else {
                return (
                    <ImageListItem key={file.name} cols={1} rows={1}>
                        <img
                            src={file.preview}
                            alt={file.name}
                            loading="lazy"
                        />
                    </ImageListItem>
                )
            }
        })
    ) : '';


    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const handleChange = (event) => {
        const { name, value } = event.target;
        setData({ ...data, [name]: value })
    }

    const save = async () => {
        try {
            await APIPATCH.UpdateDisposition(disId, data);
            await APIPATCH.UpdateStatusSikoja(sikojaId, { status_id: 3 });
            await Promise.all(files.map(async (file) => {
                const data = new FormData();
                data.append('file', file);
                data.append('sikojadisp_id', disId);
                await APIUPLOAD.UploadFile(data);
            }))
            setMessage('Status laporan telah diupdate')
            setCodeStatus(true)
            setOpenSnackbar(true)
            window.location.reload()
        } catch (e) {
            setMessage('Gagal menyimpan perubahan, coba lagi!')
            setCodeStatus(false)
            setOpenSnackbar(true)
            setOpenBackdrop(false)
        }
    }
    const handleSubmit = (event) => {
        event.preventDefault();
        if (anyFiles < 1) {
            setMessage('Upload gambar sebagai dokumentasi!')
            setCodeStatus(false)
            setOpenSnackbar(true)
        } else {
            setOpen(false)
            setOpenBackdrop(true)
            save()
        }
    }

    const handleFinishOk = (event) => {
        event.preventDefault();
        setOpenDialog(false)
        setOpenBackdrop(true);
        APIPATCH.UpdateStatusSikoja(sikojaId, { status_id: 4 }).then(() => {
            setMessage('Laporan selesai')
            setCodeStatus(true)
            setOpenSnackbar(true)
            setTimeout(() => {
                window.location.reload()
            }, 1500)
        }).catch(() => {
            setMessage('Gagal mengupdate status, coba lagi!')
            setCodeStatus(false)
            setOpenSnackbar(true)
            setOpenBackdrop(false)
        })
    }
    const handleConfirm = () => {
        setOpenDialog(true);
    };

    const handleChangeFile = (e) => {
        const acceptedFiles = Object.values(e.target.files);
        setFiles(acceptedFiles.map(file => Object.assign(file, {
            preview: URL.createObjectURL(file)
        })));
        setAnyFiles(files.length + 1)
    }


    return (
        <>
            <Button variant='outlined' disabled={status === 4 ? true : false} color='success' onClick={handleOpen} sx={{ display: status === 4 ? 'none' : 'inline' }}>
                {description === null ? 'Tambah Keterangan' : 'Edit'}
            </Button>
            <Button variant='contained' disabled={status !== 3 ? true : false} onClick={handleConfirm} sx={{ ml: { lg: 1, md: 1 }, mt: { xs: 1, sm: 1, md: 0 } }}>
                Selesai
            </Button>
            <Dialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    Apakah laporan ini telah selesai?
                </DialogTitle>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Belum</Button>
                    <Button onClick={handleFinishOk} autoFocus>
                        Selesai
                    </Button>
                </DialogActions>
            </Dialog>
            <LoadingBackDrop open={openBackdrop} onClick={() => setOpenBackdrop(true)} />
            <AlertSnackbar message={message} status={codeStatus} opensnackbar={openSnackbar} setOpensnackbar={setOpenSnackbar} />
            <Modal
                scroll='body'
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
                sx={{ mx: 1 }}
            >
                <Box sx={style}>
                    <Typography id="modal-modal-title" variant="h6" component="h2" paragraph>
                        {description === null ? 'Tambahkan ' : 'Ubah '}keterangan tindaklanjut dari laporan ini.
                    </Typography>
                    <form onSubmit={handleSubmit}>
                        <FormControl fullWidth>
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                <Stack spacing={2}>
                                    <TextField
                                        autoFocus
                                        required
                                        defaultValue={data.description}
                                        margin="dense"
                                        id="description"
                                        name="description"
                                        label="keterangan"
                                        multiline
                                        rows={4}
                                        type="text"
                                        fullWidth
                                        variant="outlined"
                                        onChange={handleChange}
                                    />
                                    <Grid container >
                                        <Grid container columnSpacing={1} rowSpacing={2}>
                                            <Grid item lg={6} md={12} xs={12}>
                                                <DateTimePicker
                                                    id="start_date"
                                                    name="start_date"
                                                    label="Tanggal mulai Pengerjaan"
                                                    renderInput={(params) => <TextField fullWidth required {...params} />}
                                                    value={data.start_date}
                                                    onChange={(newValue) => {
                                                        setData({ ...data, start_date: Input(newValue) });
                                                    }}
                                                />
                                            </Grid>
                                            <Grid item lg={6} md={12} xs={12}>
                                                <DateTimePicker
                                                    id="estimation_date"
                                                    name="estimation_date"
                                                    label="Estimasi Selesai"
                                                    renderInput={(params) => <TextField fullWidth required {...params} />}
                                                    value={data.estimation_date}
                                                    onChange={(newValue) => {
                                                        setData({ ...data, estimation_date: Input(newValue) });
                                                    }}
                                                />
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                    <Paper sx={{ cursor: 'pointer', background: '#fafafa', color: '#bdbdbd', border: '1px dashed #ccc', '&:hover': { border: '1px solid #ccc' }, mt: 2, pt: 2 }}>
                                        <Container sx={{ display: 'flex', justifyContent: 'center' }}>
                                            <Button
                                                variant="text"
                                                component="label"
                                            >
                                                Upload
                                                <input
                                                    type="file"
                                                    hidden
                                                    multiple
                                                    onChange={handleChangeFile}
                                                />
                                            </Button>
                                        </Container>
                                        <div style={{ padding: '20px', height: 'auto' }} {...getRootProps()}>
                                            {isDragActive ? (
                                                <Typography align='center' variant='subtitle1' color='primary.main'> Drop disini..</Typography>
                                            ) : (
                                                <div>
                                                    <Typography align='center' variant='subtitle1'>Drag & Drop atau klik Upload untuk memilih gambar...</Typography>
                                                    <Typography align='center' variant='subtitle1'>maksimal 4 file</Typography>
                                                </div>
                                            )}
                                        </div>
                                    </Paper>
                                    {files.length != 0 ? (
                                        <Container >
                                            <ImageList
                                                sx={{ width: '100', height: 'auto' }}
                                                variant="quilted"
                                                cols={4}
                                                rowHeight={121}
                                            >
                                                {thumbs}
                                            </ImageList>
                                        </Container>
                                    ) : null}
                                </Stack>
                            </LocalizationProvider>
                        </FormControl>
                        <Button type='button' variant='contained' color='grey' onClick={handleClose} sx={{ mt: 2, mr: 1 }}>Batal</Button>
                        <Button type='submit' variant='contained' sx={{ mt: 2 }}>Simpan</Button>
                    </form>
                </Box>
            </Modal>
        </>
    )
}

export default ModalTindakLanjut