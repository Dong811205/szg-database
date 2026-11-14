import React from 'react';
import {createRoot} from 'react-dom/client';
import Home from './Home';
import BackgroundMusic from './components/background-music';
import './styles.css';
createRoot(document.getElementById('root')!).render(<><Home/><BackgroundMusic/></>);
