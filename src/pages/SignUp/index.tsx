import styled from "@emotion/styled";
import {
  Button,
  InputAdornment,
  TextField,
  Typography,
  Checkbox,
  FormControlLabel,
  Link,
} from "@mui/material";
import { useForm } from "react-hook-form";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import { useAppDispatch, useAppSelector } from "@hooks/store";
import { LoadingButton } from "@mui/lab";
import { useHistory } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import authAPI from "@services/api/auth";
import { authVerify } from "@store/slices/auth/auth.thunk";

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
  email: string;
  privacyPolicy: boolean;
};

const SignUpPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const history = useHistory();
  const dispatch = useAppDispatch();

  const recaptchaRef = useRef(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormState>({
    defaultValues: {
      email: "",
      privacyPolicy: false,
    },
  });

  const onSubmit = async (state: FormState) => {
    setLoading(true);
    setError(null);

    // if (!state.privacyPolicy) {
    //   setError("You must accept the privacy policy to proceed");
    //   setLoading(false);
    //   return;
    // }

    if (!recaptchaRef.current) {
      setError("Recaptcha not loaded");
      setLoading(false);
      return;
    }
    const token = recaptchaRef.current?.getValue();
    if (!token) {
      setError("Recaptcha not verified");
      setLoading(false);
      return;
    }
    const res = await dispatch(authVerify({ token })).unwrap();

    if (res.success) {
      console.log("Recaptcha verified successfully");
      // Proceed with sign up process
      let signupRes = await authAPI.signUp({ email: state.email });
      if (signupRes.status === 201) {
        console.log("Sign up successful");
        history.push("/login");
      } else {
        setError("Error signing up");
        setLoading(false);
        return;
      }
    } else {
      setError("Recaptcha verification failed");
      setLoading(false);
      return;
    }
    // Simulate sign up process
    // setTimeout(() => {
    //   console.log("Signed up with email:", state.email);
    //   setLoading(false);
    // }, 1500);

    // In a real application, you would dispatch an action here:
    // dispatch(authSignUp(state)).unwrap().then((res) => {
    //   history.push('/login');
    // }).catch((err) => {
    //   setError(err.message);
    // });
  };

  return (
    <Container>
      <FormContainer onSubmit={handleSubmit(onSubmit)}>
        <Typography variant="h4" fontWeight="500">
          Sign up
        </Typography>
        <Typography variant="body1" fontWeight="400">
          Create an account to get started. The credentials will be sent to your
          email. Make sure to check your spam folder.
        </Typography>
        <TextField
          {...register("email")}
          disabled={loading}
          required
          label="Email"
          type="email"
          fullWidth
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <EmailOutlinedIcon />
              </InputAdornment>
            ),
          }}
        />
        {error && <Typography color="error">{error}</Typography>}
        <Typography variant="body2" color="textSecondary">
          To prevent unauthorized access and block automated bots, the tool is
          currently in closed-access mode. You will be asked to provide an email
          address solely for the purpose of issuing temporary login credentials.
          This email address will be deleted immediately after the credentials
          are sent and will not be stored, used for any further communication,
          or shared with third parties. <br /> The full text of the Privacy
          Policy is available at
          <Link
            href="/privacy_notice.pdf"
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              e.stopPropagation();
              history.push("/privacy-policy");
            }}
          >
            this link
          </Link>{" "}
          .
        </Typography>
        {/* <FormControlLabel
          control={
            <Checkbox
              {...register("privacyPolicy", { required: true })}
              color="primary"
              disabled={loading}
            />
          }
          label={
            <Typography variant="body2">
              I accept the{" "}
              <Link
                href="/privacy_notice.pdf"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  e.stopPropagation();
                  history.push("/privacy-policy");
                }}
              >
                Privacy Policy
              </Link>
            </Typography>
          }
          style={{ alignSelf: "flex-start" }}
        /> */}

        <ReCAPTCHA
          sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
          ref={recaptchaRef}
        />
        <LoadingButton type="submit" loading={loading} variant="contained">
          Sign Up
        </LoadingButton>
        <Button
          variant="text"
          onClick={() => history.push("/login")}
          disabled={loading}
        >
          Already have an account? Sign in
        </Button>
      </FormContainer>
    </Container>
  );
};

export default SignUpPage;
