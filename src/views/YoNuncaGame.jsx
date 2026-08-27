import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Pencil } from 'lucide-react';
import { yoNuncaQuestions as defaultQuestions } from '../data/yoNuncaQuestions';
import { gameById } from '../data/games';
import OptionsEditor from '../components/OptionsEditor';
import GameShell from '../components/GameShell';
import GameCard from '../components/ui/GameCard';
import Button from '../components/ui/Button';
import { SignatureLine, SignatureHalo } from '../components/ui/Signature';

const QUESTIONS_KEY = 'yonunca_questions';
const GAME = gameById.yonunca;

const Kicker = styled.p`
  position: relative;
  margin: 0 0 ${({ theme }) => theme.spacing(4)};
  font-size: 12px;
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${GAME.color};
  text-transform: uppercase;
  letter-spacing: 0.14em;
`;

const Phrase = styled.p`
  position: relative;
  margin: 0;
  font-size: 27px;
  line-height: 1.28;
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  letter-spacing: -0.02em;
  color: ${({ theme }) => theme.colors.text.primary};
  text-wrap: pretty;
`;

const Note = styled.p`
  align-self: flex-start;
  margin: 0 2px;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.muted};
`;

const FooterRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2.5)};
`;

const EditButton = styled.button`
  width: 52px;
  height: 50px;
  flex-shrink: 0;
  border-radius: ${({ theme }) => theme.radii.sm};
  border: 1px solid ${({ theme }) => theme.colors.borderStrong};
  color: ${({ theme }) => theme.colors.text.secondary};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color ${({ theme }) => theme.transitions.fast};

  &:hover {
    border-color: ${({ theme }) => theme.colors.borderHover};
  }
`;

export default function YoNuncaGame() {
    const navigate = useNavigate();
    const [index, setIndex] = useState(0);
    const [questions, setQuestions] = useState(defaultQuestions);
    const [showEditor, setShowEditor] = useState(false);

    useEffect(() => {
        try {
            const saved = localStorage.getItem(QUESTIONS_KEY);
            if (saved) setQuestions(JSON.parse(saved));
        } catch (error) {
            console.error('Error loading questions:', error);
        }
    }, []);

    const saveQuestions = (newQuestions) => {
        try {
            localStorage.setItem(QUESTIONS_KEY, JSON.stringify(newQuestions));
            setQuestions(newQuestions);
            setShowEditor(false);
            if (index >= newQuestions.length) setIndex(0);
        } catch (error) {
            console.error('Error saving questions:', error);
        }
    };

    const isLast = index === questions.length - 1;

    const handleNext = () => {
        if (!isLast) setIndex((prev) => prev + 1);
        else navigate(-1);
    };

    return (
        <GameShell
            gameId="yonunca"
            status={`${index + 1} de ${questions.length}`}
            progress={(index + 1) / questions.length}
            showPlayers={false}
            footer={
                <FooterRow>
                    <EditButton onClick={() => setShowEditor(true)} aria-label="Editar frases">
                        <Pencil size={20} />
                    </EditButton>
                    <Button size="lg" color={GAME.color} fullWidth onClick={handleNext}>
                        {isLast ? 'Finalizar' : 'Siguiente frase'}
                    </Button>
                </FooterRow>
            }
        >
            <GameCard key={index}>
                <SignatureLine $color={GAME.color} aria-hidden="true" />
                <SignatureHalo
                    $glow="rgba(226, 87, 43, 0.16)"
                    $size="130px"
                    $right="-24px"
                    $top="-30px"
                    aria-hidden="true"
                />
                <Kicker>Yo nunca...</Kicker>
                <Phrase>{questions[index]}</Phrase>
            </GameCard>
            <Note>Si lo has hecho, bebes. Sin turnos y sin ganadores.</Note>

            <OptionsEditor
                visible={showEditor}
                items={questions}
                onSave={saveQuestions}
                onCancel={() => setShowEditor(false)}
                title="Editar frases"
                placeholder="Yo nunca..."
            />
        </GameShell>
    );
}
