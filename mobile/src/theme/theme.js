import { MD3LightTheme } from 'react-native-paper';
import { Colors } from './colors';

export const paperTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: Colors.primary,
    primaryContainer: Colors.primaryLighter,
    secondary: Colors.primaryLight,
    surface: Colors.white,
    background: Colors.background,
    error: Colors.danger,
    onPrimary: Colors.white,
    onSurface: Colors.text,
  },
};

export default paperTheme;
