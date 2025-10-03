import styled from "@emotion/styled";
import {
  Button,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import { useForm } from "react-hook-form";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import VisibilityOffOutlined from "@mui/icons-material/VisibilityOffOutlined";
import VisibilityOutlined from "@mui/icons-material/VisibilityOutlined";
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@hooks/store";
import { authSignIn } from "@store/slices/auth/auth.thunk";
import { selectSignInStatus } from "@store/slices/auth/auth.selectors";
//import { LoadingButton } from "@mui/lab";
import { useHistory } from "react-router-dom";

const Container = styled.div({
  height: "100%",
  width: "100%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
});

const FormContainer = styled.form({
  display: "flex",
  flexDirection: "column",
  gap: "10px",
  alignItems: "center",
  maxWidth: "400px",
  width: "100%",
});

type FormState = {
  username: string;
  password: string;
};

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector(selectSignInStatus);
  const history = useHistory();

  const { register, handleSubmit } = useForm<FormState>({
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const handleClickShowPassword = () => {
    setShowPassword((p) => !p);
  };

  const onSubmit = (state: FormState) => {
    dispatch(authSignIn(state))
      .unwrap()
      .then((res) => {
        history.push("/datasets");
      })
      .catch((err) => {});
  };

  return (
    <Container>
      <FormContainer onSubmit={handleSubmit(onSubmit)}>
        <Typography variant="h4" fontWeight="500">
          Sign in
        </Typography>
        <TextField
          {...register("username")}
          disabled={!!loading}
          required
          label="Username"
          fullWidth
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <AccountCircleOutlinedIcon />
              </InputAdornment>
            ),
          }}
        />
        <TextField
          {...register("password")}
          type={showPassword ? "text" : "password"}
          disabled={!!loading}
          required
          label="Password"
          fullWidth
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={handleClickShowPassword}
                  edge="end"
                >
                  {showPassword ? (
                    <VisibilityOffOutlined />
                  ) : (
                    <VisibilityOutlined />
                  )}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        {error && <Typography color="error">{error}</Typography>}
        <Button type="submit" loading={loading} variant="contained">
          Confirm
        </Button>
        <Button
          variant="text"
          onClick={() => history.push("/signup")}
          disabled={loading}
        >
          Don't have an account? Sign up
        </Button>
      </FormContainer>
    </Container>
  );
};

export default LoginPage;
