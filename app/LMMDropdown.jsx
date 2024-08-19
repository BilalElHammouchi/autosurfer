import React, {useState} from "react";
import {Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button, cn} from "@nextui-org/react";
import {GPTIcon} from "./GPTIcon.jsx";
import {GeminiIcon} from "./GeminiIcon.jsx";
import styles from '../styles/dropdown.module.css';

export default function LMMDropdown({setLmm}) {
  const iconClasses = "text-xl text-default-500 pointer-events-none flex-shrink-0";
  let [lmm, setMyLmm] = useState('Select LMM');

  const handleChangeLMM = (newName) => {
    setLmm(newName);
    setMyLmm(newName);
  };


  return (
    <div className={styles.lmmdropdown}>
      <Dropdown >
      <DropdownTrigger>
        <Button 
          variant="bordered" 
        >
          {lmm}
        </Button>
      </DropdownTrigger>
      <DropdownMenu variant="faded" aria-label="Dropdown menu with icons" onAction={(key => handleChangeLMM(key))}>
        <DropdownItem key="GPT-4o"
          startContent={<GPTIcon className={iconClasses} />}
        >
          GPT-4o
        </DropdownItem>
        <DropdownItem key="Gemini 1.5 Flash"
          startContent={<GeminiIcon className={iconClasses} />}
        >
          Gemini 1.5 Flash
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
    </div>
  );
}
