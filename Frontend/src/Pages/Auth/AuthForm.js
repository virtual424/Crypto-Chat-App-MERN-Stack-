import React, { useState, useContext } from "react";
import { Avatar } from "@material-ui/core";
import styles from "./AuthForm.module.css";
import Card from "../../components/UI/Card.js";
import WhatsAppIcon from "@material-ui/icons/WhatsApp";
import useInput from "../../hooks/Input";
import AuthContext from "../../store/AuthContext";
import Button from "../../components/UI/Button";
import Input from "../../components/UI/Input";

const AuthForm = () => {
  const [showSignup, setShowSignup] = useState(false);
  const authCtx = useContext(AuthContext);
  const [image, setImage] = useState(null);

  const {
    enteredInput: enteredName,
    inputChangeHandler: nameChangeHandler,
    blurChangeHandler: nameBlurHandler,
    hasError: nameHasError,
    resetInput: resetName,
    isValid: nameIsValid,
  } = useInput(/^[a-zA-Z ]+$/); // eslint-disable-line

  const {
    enteredInput: enteredKey,
    inputChangeHandler: keyChangeHandler,
    blurChangeHandler: keyBlurHandler,
    hasError: keyHasError,
    resetInput: resetkey,
    isValid: keyIsValid,
  } = useInput(/.*/); // eslint-disable-line

  const {
    enteredInput: enteredEmail,
    inputChangeHandler: emailChangeHandler,
    blurChangeHandler: emailBlurHandler,
    hasError: emailHasError,
    resetInput: resetEmail,
    isValid: emailIsValid,
  } = useInput(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/); // eslint-disable-line

  const {
    enteredInput: enteredPassword,
    inputChangeHandler: passwordChangeHandler,
    blurChangeHandler: passwordBlurHandler,
    hasError: passwordHasError,
    resetInput: resetPassword,
    isValid: passwordIsValid,
  } = useInput(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/); // eslint-disable-line

  const {
    enteredInput: enteredConfirmPassword,
    inputChangeHandler: confirmPasswordChangeHandler,
    blurChangeHandler: confirmPasswordBlurHandler,
    hasError: confirmPasswordHasError,
    resetInput: resetConfirmPassword,
    isValid: confirmPasswordIsValid,
  } = useInput(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/); // eslint-disable-line

  const showSignupHandler = (event) => {
    event.preventDefault();
    setShowSignup((prevState) => !prevState);
    resetName();
    resetEmail();
    resetPassword();
    resetConfirmPassword();
    resetkey();
  };

  let formIsValid = false;

  if (
    (showSignup &&
      nameIsValid &&
      emailIsValid &&
      passwordIsValid &&
      confirmPasswordIsValid) ||
    (!showSignup && emailIsValid && passwordIsValid && keyIsValid)
  ) {
    formIsValid = true;
  }

  const submitHandler = (event) => {
    event.preventDefault();
    if (
      (showSignup &&
        nameIsValid &&
        emailIsValid &&
        passwordIsValid &&
        confirmPasswordIsValid &&
        enteredPassword === enteredConfirmPassword) ||
      (!showSignup && emailIsValid && passwordIsValid && keyIsValid)
    ) {
      if (showSignup) {
        authCtx.signUp(enteredName, enteredEmail, enteredPassword, image);
      } else {
        authCtx.signIn(enteredEmail, enteredPassword, enteredKey);
      }
      resetName();
      resetEmail();
      resetPassword();
      resetConfirmPassword();
      resetkey();
    }
  };

  const captureImage = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setImage(reader.result);
    };
  };

  const invalidClassName = nameHasError
    ? `${styles.input} ${styles.invalid}`
    : `${styles.input}`;
  const invalidClassEmail = emailHasError
    ? `${styles.input} ${styles.invalid}`
    : `${styles.input}`;
  const invalidClassPassword = passwordHasError
    ? `${styles.input} ${styles.invalid}`
    : `${styles.input}`;
  const invalidClassConfirmPassword = confirmPasswordHasError
    ? `${styles.input} ${styles.invalid}`
    : `${styles.input}`;
  const invalidClassKey = keyHasError
    ? `${styles.input} ${styles.invalid}`
    : `${styles.input}`;

  const nameErrorText = nameHasError ? (
    <p className={styles.errorText}>Please enter a valid name</p>
  ) : null;
  const keyErrorText = keyHasError ? (
    <p className={styles.errorText}>Please enter a valid key</p>
  ) : null;
  const emailErrorText = emailHasError ? (
    <p className={styles.errorText}>Please enter a valid email address</p>
  ) : null;
  const passwordErrorText = passwordHasError ? (
    <p className={styles.errorText}>Please enter a valid password</p>
  ) : null;
  const confirmPasswordErrorText = confirmPasswordHasError ? (
    <p className={styles.errorText}>Please enter a valid password</p>
  ) : null;

  const buttonText = showSignup ? "SignUp" : "SignIn";
  const linkText = !showSignup ? "SignUp" : "SignIn";

  return (
    <React.Fragment>
      <AuthBackground />
      <div className={styles.authForm}>
        <Card className={styles.authCard}>
          {showSignup ? <h2>Sign Up</h2> : <h2>Sign In</h2>}
          {showSignup ? (
            <Avatar
              style={{ height: "70px", width: "70px" }}
              className={styles.avatar}
              src={image}
            />
          ) : null}
          {showSignup ? (
            <div>
              <input
                onChange={captureImage}
                id="avatarInput"
                type="file"
                className={styles.avatarInput}
              />
              <label className={styles.avatarLabel} htmlFor="avatarInput">
                Choose a Profile Picture(.png)
              </label>
            </div>
          ) : null}
          <form className={styles.form} onSubmit={submitHandler}>
            {showSignup && (
              <Input
                className={invalidClassName}
                type="text"
                placeholder="Name"
                value={enteredName}
                onChange={nameChangeHandler}
                onBlur={nameBlurHandler}
              />
            )}
            {nameErrorText}
            <Input
              className={invalidClassEmail}
              type="email"
              placeholder="Email"
              value={enteredEmail}
              onChange={emailChangeHandler}
              onBlur={emailBlurHandler}
            />
            {emailErrorText}
            <Input
              className={invalidClassPassword}
              type="password"
              placeholder="Password"
              value={enteredPassword}
              onChange={passwordChangeHandler}
              onBlur={passwordBlurHandler}
            />
            {passwordErrorText}
            {!showSignup && (
              <Input
                className={invalidClassKey}
                type="password"
                placeholder="Key"
                value={enteredKey}
                onChange={keyChangeHandler}
                onBlur={keyBlurHandler}
              />
            )}
            {keyErrorText}
            {showSignup && (
              <Input
                className={invalidClassConfirmPassword}
                type="password"
                placeholder="Confirm Password"
                value={enteredConfirmPassword}
                onChange={confirmPasswordChangeHandler}
                onBlur={confirmPasswordBlurHandler}
              />
            )}
            {confirmPasswordErrorText}
            <Button type="submit" disabled={!formIsValid} text={buttonText} />
            <span className={styles.span}>
              Already have an account ?
              <a
                className={styles.signupLink}
                href="@"
                onClick={showSignupHandler}
              >
                {linkText}
              </a>
            </span>
          </form>
        </Card>
      </div>
    </React.Fragment>
  );
};

const AuthBackground = () => {
  return (
    <div className={styles.header}>
      <div>
        <WhatsAppIcon fontSize="large" />
        <h2 className={styles.appName}>Crypto-Chat-App</h2>
      </div>
    </div>
  );
};

export default AuthForm;
