import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { IoSettingsOutline } from 'react-icons/io5';
import { Beer, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { yoNuncaQuestions as defaultQuestions } from '../data/yoNuncaQuestions';
import OptionsEditor from '../components/OptionsEditor';
import HowToPlayModal from '../components/HowToPlayModal';
import PageHeader from '../components/ui/PageHeader';
import IconButton from '../components/ui/IconButton';
import Button from '../components/ui/Button';

const QUESTIONS_KEY = 'yonunca_questions';

const Container = styled.div`
  min-height: 100dvh;
  background-color: ${({ theme }) => theme.colors.background};
  display: flex;
  flex-direction: column;
`;

const Content = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: ${({ theme }) => theme.spacing(6)};
  max-width: 560px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
`;

const QuestionCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: ${({ theme }) => theme.spacing(8)};
  width: 100%;
  min-height: 260px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  box-shadow: ${({ theme }) => theme.shadows.md};
  margin-bottom: ${({ theme }) => theme.spacing(6)};
  box-sizing: border-box;
`;

const YoNuncaTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin: 0 0 ${({ theme }) => theme.spacing(4)} 0;
  text-align: center;
`;

const QuestionText = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.primary};
  text-align: center;
  line-height: 1.4;
  margin: 0;
`;

const Instruction = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  color: ${({ theme }) => theme.colors.text.secondary};
  text-align: center;
  margin: 0;
`;

const ButtonWrap = styled.div`
  padding: ${({ theme }) => theme.spacing(4)} ${({ theme }) => theme.spacing(6)}
    ${({ theme }) => theme.spacing(8)};
  max-width: 560px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
`;

export default function YoNuncaGame() {
    const navigate = useNavigate();
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [questions, setQuestions] = useState(defaultQuestions);
    const [showEditor, setShowEditor] = useState(false);
    const [showHelp, setShowHelp] = useState(false);

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
            <PageHeader
                title={`${currentQuestionIndex + 1}/${questions.length}`}
                onBack={() => navigate(-1)}
                rightAction={
                    <div style={{ display: 'flex', gap: '4px' }}>
                        <IconButton variant="ghost" onClick={() => setShowHelp(true)} aria-label="Cómo se juega">
                            <HelpCircle size={20} />
                        </IconButton>
                        <IconButton variant="ghost" onClick={() => setShowEditor(true)} aria-label="Editar frases">
                            <IoSettingsOutline size={20} />
                        </IconButton>
                    </div>
                }
            />

            <OptionsEditor
                visible={showEditor}
                items={questions}
                onSave={saveQuestions}
                onCancel={() => setShowEditor(false)}
                title="Editar Frases"
                placeholder="Yo nunca..."
            />

            <HowToPlayModal visible={showHelp} onClose={() => setShowHelp(false)} title="Yo nunca...">
                <p>
                    Va saliendo una frase que empieza por «Yo nunca...». Si alguna vez lo has hecho,
                    bebes — así de simple.
                </p>
                <p>
                    No hay turnos ni ganadores: es solo ir tirando frases hasta que a alguien se le
                    acabe la vergüenza. Si las que trae la app no te convencen, dale al icono de
                    ajustes y edítalas a tu gusto.
                </p>
            </HowToPlayModal>

            <Content>
                <AnimatePresence mode="wait">
                    <QuestionCard
                        key={currentQuestionIndex}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                    >
                        <YoNuncaTitle>Yo nunca...</YoNuncaTitle>
                        <QuestionText>{currentQuestion}</QuestionText>
                    </QuestionCard>
                </AnimatePresence>

                <Instruction>
                    {isLastQuestion ? '¡Última pregunta!' : (
                        <>Si lo has hecho, ¡bebe! <Beer size={16} style={{ verticalAlign: 'middle' }} /></>
                    )}
                </Instruction>
            </Content>

            <ButtonWrap>
                <Button size="lg" fullWidth onClick={handleNext}>
                    {isLastQuestion ? 'Finalizar' : 'Siguiente'}
                </Button>
            </ButtonWrap>
        </Container>
    );
}
