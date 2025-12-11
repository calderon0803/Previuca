import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { IoArrowBack, IoSettingsOutline } from 'react-icons/io5';
import { motion, AnimatePresence } from 'framer-motion';
import { yoNuncaQuestions as defaultQuestions } from '../data/yoNuncaQuestions';
import QuestionEditor from '../components/QuestionEditor';

const QUESTIONS_KEY = 'yonunca_questions';

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea, #764ba2);
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  padding: 20px;
  padding-top: 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const IconButton = styled.button`
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(255,255,255,0.2);
  border: none;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  color: #fff;
  transition: background 0.2s;
  
  &:hover {
    background: rgba(255,255,255,0.3);
  }
`;

const CounterContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Counter = styled.span`
  color: #fff;
  font-size: 18px;
  font-weight: bold;
`;

const Content = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 24px;
  max-width: 600px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
`;

const QuestionCard = styled(motion.div)`
  background: #fff;
  border-radius: 24px;
  padding: 32px;
  width: 100%;
  min-height: 280px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
  margin-bottom: 32px;
  box-sizing: border-box;
`;

const YoNuncaTitle = styled.h2`
  font-size: 28px;
  font-weight: bold;
  color: #667eea;
  margin: 0 0 16px 0;
  text-align: center;
`;

const QuestionText = styled.p`
  font-size: 24px;
  color: #333;
  text-align: center;
  line-height: 1.4;
  margin: 0;
`;

const Instruction = styled.p`
  font-size: 18px;
  color: #fff;
  text-align: center;
  opacity: 0.9;
  margin: 0;
`;

const NextButton = styled(motion.button)`
  margin: 0 24px 40px 24px;
  border-radius: 16px;
  border: none;
  background: linear-gradient(135deg, #f093fb, #f5576c);
  padding: 18px;
  width: calc(100% - 48px);
  max-width: 550px;
  align-self: center;
  color: #fff;
  font-size: 20px;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  
  &:hover {
    filter: brightness(1.05);
  }
`;

export default function YoNuncaGame() {
    const navigate = useNavigate();
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [questions, setQuestions] = useState(defaultQuestions);
    const [showEditor, setShowEditor] = useState(false);

    useEffect(() => {
        loadQuestions();
    }, []);

    const loadQuestions = () => {
        try {
            const saved = localStorage.getItem(QUESTIONS_KEY);
            if (saved) {
                setQuestions(JSON.parse(saved));
            }
        } catch (error) {
            console.error('Error loading questions:', error);
        }
    };

    const saveQuestions = (newQuestions) => {
        try {
            localStorage.setItem(QUESTIONS_KEY, JSON.stringify(newQuestions));
            setQuestions(newQuestions);
            setShowEditor(false);
            if (currentQuestionIndex >= newQuestions.length) {
                setCurrentQuestionIndex(0);
            }
        } catch (error) {
            console.error('Error saving questions:', error);
        }
    };

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            navigate(-1);
        }
    };

    const currentQuestion = questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === questions.length - 1;

    return (
        <Container>
            <Header>
                <IconButton onClick={() => navigate(-1)}>
                    <IoArrowBack size={24} />
                </IconButton>
                <CounterContainer>
                    <Counter>
                        {currentQuestionIndex + 1}/{questions.length}
                    </Counter>
                    <IconButton onClick={() => setShowEditor(true)}>
                        <IoSettingsOutline size={24} />
                    </IconButton>
                </CounterContainer>
            </Header>

            <QuestionEditor
                visible={showEditor}
                questions={questions}
                onSave={saveQuestions}
                onCancel={() => setShowEditor(false)}
            />

            <Content>
                <AnimatePresence mode="wait">
                    <QuestionCard
                        key={currentQuestionIndex}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        transition={{ duration: 0.2 }}
                    >
                        <YoNuncaTitle>Yo nunca...</YoNuncaTitle>
                        <QuestionText>{currentQuestion}</QuestionText>
                    </QuestionCard>
                </AnimatePresence>

                <Instruction>
                    {isLastQuestion ? '¡Última pregunta!' : 'Si lo has hecho, ¡bebe! 🍺'}
                </Instruction>
            </Content>

            <NextButton
                onClick={handleNext}
                whileTap={{ scale: 0.98 }}
            >
                {isLastQuestion ? 'Finalizar' : 'Siguiente'}
            </NextButton>
        </Container>
    );
}
