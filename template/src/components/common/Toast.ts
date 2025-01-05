import SimpleToast from 'react-native-simple-toast';

export const showToast = (message: string) => {
  SimpleToast.showWithGravity(message, SimpleToast.SHORT, SimpleToast.TOP);
};
