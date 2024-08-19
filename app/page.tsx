// pages/index.tsx
"use client"; // Add this at the top

import React, { useState, useEffect, use } from 'react';
import Head from 'next/head';
import styles from '../styles/home.module.css';
import LMMDropdown from './LMMDropdown';
import { Image } from "@nextui-org/image";
import { Input, Button } from '@nextui-org/react';
import Alert from '@mui/material/Alert';
import {CircularProgress} from "@nextui-org/progress";
import {Textarea} from "@nextui-org/input";
import { maxWidth } from '@mui/system';
import AppRouter from 'next/dist/client/components/app-router';


export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [website, setWebsite] = useState('');
  let [lmm, setLmm] = useState('');
  let [isLoading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [response, setResponse] = useState('');
  const [imageSrc, setImageSrc] = useState('/logo.png');
  let [lmmFeedback, setlmmFeedback] = useState('');
  const [jsonData, setJsonData] = useState(null);

  const handlePromptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrompt(e.target.value);
  };

  const handleWebsiteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWebsite(e.target.value);
  };

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
      const response = await fetch(`http://127.0.0.1:5000/prompt?prompt=${encodedPrompt}&website=${encodedWebsite}`);
      const body = await response.json();
      const formattedSteps = body["steps"].map((step: { [s: string]: unknown; } | ArrayLike<unknown>, index: any) => {
        return `* Step ${index} -> ${Object.values(step).join('\n-> ')}`;
      }).join('\n\n');
      setlmmFeedback('* Step 0 -> '+Object.values(body["steps"][0]).join('\n-> '));
      const responseImage = await fetch(`http://127.0.0.1:5000/prompt_image`);
      const blob = await responseImage.blob();
      const imageSrc = URL.createObjectURL(blob);
      setImageSrc(imageSrc);
      setResponse('true');
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  return (
    <div>
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
                label="LMM Feedback"
                variant="bordered"
                labelPlacement="outside"
                placeholder="Waiting on prompt..."
                defaultValue=""
                value={lmmFeedback}
                className={styles.lmmFeedback}
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
        </div>
      </div>
    </div>
  );
}
