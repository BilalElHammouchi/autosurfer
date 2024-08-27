// pages/index.tsx
"use client"; // Add this at the top

import React, { useState, useEffect, use, useRef } from 'react';
import Head from 'next/head';
import styles from '../styles/home.module.css';
import LMMDropdown from './LMMDropdown';
import { Image } from "@nextui-org/image";
import { Input, Button, Progress, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from '@nextui-org/react';
import Alert from '@mui/material/Alert';
import {CircularProgress} from "@nextui-org/progress";
import {Textarea} from "@nextui-org/input";


export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [website, setWebsite] = useState('');
  let [lmm, setLmm] = useState('');
  let [isLoading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [response, setResponse] = useState('');
  const [imageSrc, setImageSrc] = useState('/logo.png');
  let [lmmFeedback, setlmmFeedback] = useState('');
  const [jsonData, setJsonData] = useState({"steps": []});
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const {isOpen, onOpen, onClose} = useDisclosure();
  const [seconds, setSeconds] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [steps, setSteps] = useState(0);
  let interval: string | number | NodeJS.Timeout | undefined;

  const handlePromptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrompt(e.target.value);
  };

  const handleWebsiteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWebsite(e.target.value);
  };

  function formatTime(seconds: number) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
  
    if (minutes > 0 && remainingSeconds > 0) {
      return `${minutes} Minute${minutes !== 1 ? 's' : ''} and ${remainingSeconds} Second${remainingSeconds !== 1 ? 's' : ''}`;
    } else if (minutes > 0) {
      return `${minutes} Minute${minutes !== 1 ? 's' : ''}`;
    } else {
      return `${remainingSeconds} Second${remainingSeconds !== 1 ? 's' : ''}`;
    }
  }

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.scrollTop = textAreaRef.current.scrollHeight;
    }
  }, [lmmFeedback]);

  useEffect(() => {
    if (isTimerActive) {
      console.log("**Seconds: ", seconds);
      interval = setInterval(() => {
        setSeconds((prevSeconds) => prevSeconds + 1);
      }, 1000);
    } else if (!isTimerActive && seconds !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, seconds]);

  const handleSubmit = async () => {
    
    // Handle the form submission logic
    console.log('Prompt:', prompt);
    console.log('Website:', website);
    console.log('Selected LMM:', lmm);
    if (!lmm) {
      setError('Please select a Language Model.');
      const timer = setTimeout(() => {
        setError('');
      }, 3000);
  
      return () => clearTimeout(timer);
    }
    
    if (!prompt) {
      setError('Please enter a prompt.');
      const timer = setTimeout(() => {
        setError('');
      }, 3000);
  
      return () => clearTimeout(timer);
    }
    // Encode the input strings
    const encodedPrompt = encodeURIComponent(prompt);
    const encodedWebsite = encodeURIComponent(website);
    
    try {
      setLoading(true);
      setIsTimerActive(true);
      const response = await fetch(`http://127.0.0.1:5000/initial_step?prompt=${encodedPrompt}&website=${encodedWebsite}`);
      const body = await response.json();
      const formattedThoughts = body.steps.map((step: { Thought: any; }, index: any) => {
        return `* Step ${index} -> ${step.Thought}`;
      }).join('\n\n');
      setlmmFeedback(formattedThoughts);
      const responseImage = await fetch(`http://127.0.0.1:5000/prompt_image`);
      const blob = await responseImage.blob();
      const imageSrc = URL.createObjectURL(blob);
      setImageSrc(imageSrc);
      setResponse('true');
      while (true) {
        const response = await fetch(`http://127.0.0.1:5000/prompt`);
        const body = await response.json();
        console.log(body);
        console.log("Seconds: ",seconds);
        const formattedThoughts = body.steps.map((step: { Thought: any; }, index: any) => {
          return `* Step ${index} -> ${step.Thought}`;
        }).join('\n\n');
        setlmmFeedback(formattedThoughts);
        if (body.steps[body.steps.length-1]["Action"].includes("ANSWER;")) {
          setSteps(body.steps.length);
          setJsonData(body);
          break;
        }
        const responseImage = await fetch(`http://127.0.0.1:5000/prompt_image`);
        const blob = await responseImage.blob();
        const imageSrc = URL.createObjectURL(blob);
        setImageSrc(imageSrc);
      }
      onOpen();
      setLoading(false);
      setIsTimerActive(false);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  function downloadJSON() {
    const jsonStr = JSON.stringify(jsonData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = "prompt.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <Modal backdrop="blur" isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">LMM Answer</ModalHeader>
              <ModalBody>
                <p> 
                  {jsonData.steps[jsonData.steps.length-1]["Thought"]}
                </p>
                <Table hideHeader isStriped aria-label="Example static collection table">
                  <TableHeader>
                    <TableColumn>NAME</TableColumn>
                    <TableColumn>ROLE</TableColumn>
                  </TableHeader>
                  <TableBody>
                    <TableRow key="1">
                      <TableCell>LMM Used</TableCell>
                      <TableCell>{lmm}</TableCell>
                    </TableRow>
                    <TableRow key="2">
                      <TableCell>Surfing Duration</TableCell>
                      <TableCell>{formatTime(seconds)}</TableCell>
                    </TableRow>
                    <TableRow key="3">
                      <TableCell>Amount of Steps</TableCell>
                      <TableCell>{steps} Steps</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button color="primary" onPress={downloadJSON}>
                  Download JSON
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <Head>
        <title>AutoSurfer</title>
      </Head>
      <div className={styles.box}>
        <div className={styles.boxContainer}>
          {error && <Alert variant="filled" severity="error" className={styles.myError}>
            {error}
          </Alert>}
          <div className={styles.header}>
            <LMMDropdown setLmm={setLmm} />
            <p className={styles.title}>
              AutoSurfer
            </p>
          </div>
          <div className={styles.contentParent}>
            <div className={styles.myImage}>
              <Image
                width={response ? 700 : 400}
                alt="AutoSurfer Logo"
                src={imageSrc}
              />
            </div>
            <div className={styles.textAreaDiv}>
              <Textarea
                isReadOnly
                ref={textAreaRef}
                label="LMM Feedback"
                variant="bordered"
                labelPlacement="outside"
                placeholder="Waiting on prompt..."
                defaultValue=""
                value={lmmFeedback}
                className="flex w-full flex-wrap md:flex-nowrap mb-6 md:mb-0 gap-15 pr-4"
              />
            </div>
          </div>
          <div className={styles.footer}>
            <Input
              isRequired
              type="text"
              label="Prompt"
              className={styles.promptInput}
              placeholder="Enter your prompt"
              onChange={handlePromptChange}
              value={prompt}
              variant="faded"
            />
            <Input
              type="text"
              className={styles.websiteInput}
              label="Website"
              placeholder="Enter website (optional)"
              onChange={handleWebsiteChange}
              value={website}
              variant="faded"
              description="Website for the model to start surfing from"
            />
            {isLoading ? 
            <CircularProgress className={styles.progressIndicator} size="lg" aria-label="Loading..."/> : 
            <Button
              color='primary'
              variant='ghost' 
              onClick={handleSubmit} 
              className={styles.submitButton}>
              Surf
            </Button>}
          </div>
          {isLoading && <Progress
            size="sm"
            isIndeterminate
            aria-label="Loading..."
          />}
        </div>
      </div>
    </div>
  );
}
