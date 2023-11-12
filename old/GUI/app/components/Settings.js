// @flow
import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import {
  Typography,
  Paper,
  Box,
  FormGroup,
  Button,
  Grid,
  Collapse,
  CircularProgress
} from '@material-ui/core';
import { green } from '@material-ui/core/colors';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import TextField from './Form/TextField';
import SelectField from './Form/SelectField';
import FileField from './Form/FileField';
import SwitchField from './Form/SwitchField';
import type { ConfigObjectType, SettingsStateType } from '../types/settings';

type Props = {
  saveSettings: ConfigObjectType => void,
  classes: {
    root: *,
    formControl: *,
    buttonWrapper: *,
    buttonProgress: *
  }
} & SettingsStateType;

const style = theme => ({
  root: {
    padding: theme.spacing(3, 2)
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120
  },
  buttonWrapper: {
    margin: theme.spacing(1),
    position: 'relative'
  },
  buttonProgress: {
    color: green[500],
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12
  }
});

class Settings extends Component<Props> {
  props: Props;

  formSubmit = values => {
    const { saveSettings } = this.props;
    saveSettings({
      configured: true,
      local: values.local,
      apiProtocol: values.apiProtocol,
      apiHostname: values.apiHostname,
      apiPort: parseInt(values.apiPort, 10),
      apiPath: values.apiPath,
      publicPath: values.publicPath,
      dataPath: values.dataPath,
      socketPath: values.socketPath,
      containerName: values.containerName,
      apiKey: values.apiKey
    });
  };

  render() {
    const { classes, settings } = this.props;
    const { saving: isSaving } = settings.state;
    const validationSchema = Yup.object().shape({
      apiProtocol: Yup.string().required(),
      apiHostname: Yup.string().required(),
      apiPort: Yup.number()
        .positive()
        .integer()
        .min(1)
        .max(65535),
      apiPath: Yup.string().required(),
      publicPath: Yup.string().required(),
      local: Yup.boolean(),
      dataPath: Yup.string().when('local', {
        is: true,
        then: Yup.string().required(),
        otherwise: Yup.string().notRequired()
      }),
      socketPath: Yup.string().when('local', {
        is: true,
        then: Yup.string().required(),
        otherwise: Yup.string().notRequired()
      }),
      containerName: Yup.string().when('local', {
        is: true,
        then: Yup.string().required(),
        otherwise: Yup.string().notRequired()
      }),
      apiKey: Yup.string().when('local', {
        is: true,
        then: Yup.string().notRequired(),
        otherwise: Yup.string().required()
      })
    });
    return (
      <Box>
        <Paper className={classes.root}>
          <Typography variant="h5" component="h3">
            Settings
          </Typography>
          <Typography component="p" />
          <Formik
            initialValues={settings}
            validationSchema={validationSchema}
            onSubmit={this.formSubmit}
          >
            {({ values }) => (
              <Form>
                <SelectField
                  label="API Protocol"
                  name="apiProtocol"
                  options={{ http: 'http', https: 'https' }}
                  required
                />
                <TextField label="API Hostname" name="apiHostname" required />
                <TextField
                  label="API Port"
                  name="apiPort"
                  type="number"
                  required
                />
                <TextField label="API Path" name="apiPath" required />
                <TextField label="Public Path" name="publicPath" required />
                <SwitchField
                  label="Is docker installed locally?"
                  name="local"
                />
                <Collapse in={values.local}>
                  <FileField
                    label="Local container storage path"
                    name="dataPath"
                    dialogOptions={{ properties: ['openDirectory'] }}
                  />
                  <TextField
                    label="Local container name"
                    name="containerName"
                  />
                  <FileField
                    label="Local docker socket"
                    name="socketPath"
                    dialogOptions={{ properties: ['openFile'], filters: [] }}
                  />
                </Collapse>
                <TextField label="API key" name="apiKey" />
                <FormGroup row className={classes.formControl}>
                  <Grid container justify="flex-end">
                    <Grid item xs="auto">
                      <div className={classes.buttonWrapper}>
                        <Button
                          type="submit"
                          variant="contained"
                          color="primary"
                          disabled={isSaving}
                        >
                          Save
                        </Button>
                        {isSaving && (
                          <CircularProgress
                            size={24}
                            className={classes.buttonProgress}
                          />
                        )}
                      </div>
                    </Grid>
                  </Grid>
                </FormGroup>
              </Form>
            )}
          </Formik>
        </Paper>
      </Box>
    );
  }
}

export default withStyles(style)(Settings);
