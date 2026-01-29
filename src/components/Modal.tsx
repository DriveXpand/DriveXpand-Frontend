import { ArrowRightFromLine } from 'lucide-react';
import React from 'react';

function Modal({ onClose }) {
  return (
    <div className='modalBackground'>
        <div className='modalContainer'>
            <div className='title'>Anletung für Einbau</div>
            <div className='body'></div>
            <div className='footer'>
                <button onClick={onClose}> Überspringen <ArrowRightFromLine/></button>
            </div>
        </div>
    </div>
  );
}

export default Modal;


