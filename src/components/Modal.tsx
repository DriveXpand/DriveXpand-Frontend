import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ArrowRightCircle, XCircle, ChevronDown, Check } from 'lucide-react'; 
import Grid from '@mui/material/Grid';
import { Button } from "@/components/ui/button";
import { getAllDevices } from '../lib/api';
import type { DeviceEntity } from '../types/api';


import '../Modal.css';

// Fallback, falls Item nicht existiert
const Item = (props: any) => <div {...props} />;

interface ModalProps{
  onClose: () => void;
  onFinish: (vehicleData: {ID: string, Name: string}) => void;
}

function Modal({ onClose, onFinish }: ModalProps) {
  const [page, setPage] = useState(0);
  const [vehicleIdSelect, setVehicleIdSelect] = useState<string | null>(null);
  const [vehicleNameSelect, setVehicleNameSelect] = useState("");
  const [deviceList, setDeviceList] = useState<DeviceEntity[]>([])


  useEffect (() => {
    const fetchList = async() => { 
      try { 
        const carList = await getAllDevices();
        console.log("Auto:", carList);
        setDeviceList(carList);
      } catch (error) {
        console.log("Fehler beim Abrufen")
      }
    };
    fetchList();
  }, []);


  // Zeigt den Namen an oder einen Platzhalter
  //const selectedDeviceName = deviceList.find(d => d.deviceId === vehicleIdSelect)?.deviceId || "Bitte wählen...";
  
  const STEPS = [
    { 
      title: "Willkommen an Bord", 
      Grid1: "Herzlich willkommen bei DriveXpand! Wir freuen uns, dass du dich für unseren OBD2-Service entschieden hast...",
      Grid2: <img src="/DriveXpand.jpg" alt="Intro" />
    },
    { 
      title: "Den Adapter anschließen", 
      Grid1: "Suche die OBD2-Schnittstelle in deinem Auto; diese befindet sich meistens im Fußraum...",
      Grid2:<img src="/PlugIn.png" alt="Plugin" />
    },
    { 
      title: "Bluetooth-Verbindung", 
      Grid1: "Suche in den Bluetooth-Einstellungen deines Smartphones nach neuen Geräten...",
      Grid2: <img src="/BluethoothConnect.png" alt="BT" />
    },
    { 
      title: "Status-Check", 
      Grid1: "Warte bitte einen Moment, bis das Status-Display am Stecker \"Verbunden\" anzeigt...",
      Grid2: <img src="/DeviceConnected.png" alt="Check" />
    },
    { 
      title: "Gerät auswählen", 
      Grid1: "Wähle auf der nächsten Seite das entsprechende Gerät aus dem Dropdown-Menü aus...",
      Grid2: <img src="/SelectCar.png" alt="Select" />,
    },
    { 
      title: "Geräteliste", 
      // WICHTIG: Hier NUR Text! Die Logik kommt unten in den 'return' Block.
      Grid1: "Bitte wähle dein verbundenes Gerät aus der Liste und gib einen Namen ein.",
      Grid2: <img src="/SelectCar.png" alt="Select" />,
      isDropdownPage: true // Das Flag aktiviert unser Formular
    },
    { 
      title: "Alles bereit!", 
      Grid1: "Hervorragend, dein OBD2-Stecker ist nun vollständig eingerichtet!...",
      Grid2: <img src="/Connected.png" alt="Done" />
    }
  ];
  
  const isLastPage = page === STEPS.length - 1;
  const isSecondToLastPage = page === STEPS.length - 2;

  const handleNext = () => {
    if (!isLastPage) {
      setPage(page + 1);
    } 
    if (isSecondToLastPage) {
      // Validierung
      if (vehicleIdSelect === null) {
        alert("Bitte wähle ein Gerät aus!");
        setPage(STEPS.length - 2);
        return;
      }

      onFinish({
        ID: vehicleIdSelect,
        Name: vehicleNameSelect || "Mein Fahrzeug"
      }); 
      onClose();
    }
  };
  
  return createPortal(
    <div className='modalBackground'>
        <div className='modalContainer' style={{ width: '800px', minHeight: '500px' }}>
            
            <div className='title'>{STEPS[page].title}</div>

            <div className="stepper">
              {STEPS.map((_, index) => (
                <div key={index} className={`dot ${index === page ? 'active' : ''}`} />
              ))}
            </div>

            <div className='body'>
              <Grid container spacing={4} alignItems="center"> 
                {/* Linke Seite: Text + Formular */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Item style={{fontWeight: 'bold', fontSize: 20}}>
                    
                    {/* 1. Der Text aus dem Array */}
                    <div style={{ marginBottom: '20px' }}>
                      {STEPS[page].Grid1}
                    </div>

                    {/* 2. DAS FORMULAR (Nur sichtbar wenn Flag gesetzt ist) */}
                    {/* @ts-ignore */}
                    {STEPS[page].isDropdownPage && (
                      <div className='flex flex-col gap-4' style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                          
                          {/* A) Das neue Shadcn Dropdown */}
                          <div className="flex flex-col gap-2">
                            <label style={{ fontSize: '14px', color: '#666', fontWeight: 'normal' }}>Gerät wählen</label>
                             
                            <select 
                                  // Der Wert ist die ID (oder leerer String, wenn null)
                                  value={vehicleIdSelect || ""}
                                  // Beim Ändern: String in Zahl umwandeln und speichern
                                  onChange={(e) => {
                                    const selectedID = String(e.target.value);
                                    setVehicleIdSelect(selectedID)
                                    const selectedCar = deviceList.find( d => String(d.deviceId) === selectedID);
                                    if (selectedCar){
                                      setVehicleNameSelect(selectedCar.name);
                                    }
                                  }}
                                 
                                  style={{ 
                                    padding: '8px 12px', 
                                    borderRadius: '6px', 
                                    border: '1px solid #ccc',
                                    width: '100%',
                                    fontSize: '14px',
                                    height: '40px',
                                    backgroundColor: 'white',
                                    cursor: 'pointer'
                                  }}
                               >
                                  {/* Platzhalter-Option */}
                                  <option value="" disabled>{"Bitte wähle den Connector..."}</option>
                                {/* 3. Korrekter Platzhalter (Value muss leerer String sein) */}
                                  {/* Die echten Optionen */}
                                  {deviceList.map((device) => (
                                     <option key={device.deviceId} value={device.deviceId}>
                                        {device.deviceId}
                                     </option>
                                  ))}
                            </select>                             
                          </div>

                          {/* B) Das Input Feld */}
                          <div className="flex flex-col gap-2">
                            <label style={{ fontSize: '14px', color: '#666', fontWeight: 'normal' }}>Fahrzeugname</label>
                            <input 
                              type="text" 
                              placeholder="z.B. Audi A4" 
                              value={vehicleNameSelect}
                              onChange={(e) => setVehicleNameSelect(e.target.value)}
                              style={{ 
                                padding: '8px 12px', 
                                borderRadius: '6px', 
                                border: '1px solid #ccc',
                                width: '100%',
                                fontSize: '14px',
                                height: '40px'
                              }}
                            />
                          </div>      
                      </div>
                    )}

                  </Item>
                </Grid>

                {/* Rechte Seite: Bild */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Item>{STEPS[page].Grid2}</Item>
                </Grid>
              </Grid>
            </div>

            <div className='footer' style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center' }}>
                  <div className="footer-left" style={{ textAlign: 'left' }}>
                  <Button className="btn-secondary" onClick={onClose} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <XCircle size={18} /> Abbrechen
                  </Button>
                </div>
                <div className="footer-center" style={{ textAlign: 'center' }}>
                  Seite {page + 1} von {STEPS.length}
                </div>

                <div className="footer-right" style={{ textAlign: 'right' }}>
                  <Button className="btn-primary" onClick={handleNext} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
                    {isLastPage ? 'Fertigstellen' : 'Weiter'} 
                    <ArrowRightCircle size={18} />
                  </Button>
                </div>
            </div>
        </div>
    </div>,
    // @ts-ignore
    document.getElementById('modal-root')!
  );
}

export default Modal;