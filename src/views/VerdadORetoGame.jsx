import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { IoArrowBack, IoSettingsOutline, IoArrowForward } from 'react-icons/io5';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayers } from '../contexts/PlayersContext';
import { verdades as defaultVerdades, retos as defaultRetos } from '../data/verdadORetoQuestions';
import VerdadORetoEditor from '../components/VerdadORetoEditor';

const VERDADES_KEY = 'verdadoreto_verdades';
const RETOS_KEY = 'verdadoreto_retos';

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f093fb, #f5576c);
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

const Content = styled(motion.div)`
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

const PlayerIndicator = styled.div`
  background: rgba(255, 255, 255, 0.2);
  padding: 12px 24px;
  border-radius: 16px;
  margin-bottom: 20px;
  text-align: center;
`;

const PlayerLabel = styled.p`
  font-size: 14px;
  color: rgba(255,255,255,0.9);
  margin: 0 0 4px 0;
`;

const PlayerName = styled.p`
  font-size: 24px;
  font-weight: bold;
  color: #fff;
  margin: 0;
`;

const Title = styled.h2`
  font-size: 32px;
  font-weight: bold;
  color: #fff;
  margin: 0 0 40px 0;
  text-align: center;
`;

const ButtonsContainer = styled.div`
  display: flex;
  gap: 20px;
  width: 100%;
  justify-content: center;
  flex-wrap: wrap;
`;

const ChoiceButton = styled(motion.button)`
  border: none;
  border-radius: 20px;
  padding: 40px;
  flex: 1;
  min-width: 140px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 8px 16px rgba(0,0,0,0.3);
  background: ${props => props.background};
  
  &:hover {
    transform: translateY(-4px);
  }
`;

const ChoiceIcon = styled.span`
  font-size: 48px;
  margin-bottom: 12px;
  display: block;
`;

const ChoiceText = styled.span`
  font-size: 28px;
  font-weight: bold;
  color: #fff;
`;

const TypeIndicator = styled.div`
  margin-bottom: 24px;
`;

const TypeText = styled.h3`
  font-size: 24px;
  font-weight: bold;
  color: #fff;
  margin: 0;
`;

const QuestionCard = styled.div`
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

const MessageText = styled.p`
  font-size: 24px;
  color: #333;
  text-align: center;
  line-height: 1.4;
  margin: 0;
`;

const NextButton = styled(motion.button)`
  width: 100%;
  border-radius: 16px;
  border: none;
  background: linear-gradient(135deg, #667eea, #764ba2);
  padding: 18px;
  color: #fff;
  font-size: 20px;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  
  &:hover {
    filter: brightness(1.05);
  }
`;

export default function VerdadORetoGame() {
    const navigate = useNavigate();
    const { players } = usePlayers();

    const [mode, setMode] = useState('selection'); // 'selection' or 'showing'
    const [currentType, setCurrentType] = useState(null); // 'verdad' or 'reto'
    const [currentText, setCurrentText] = useState('');
    const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
    const [verdades, setVerdades] = useState(defaultVerdades);
    const [retos, setRetos] = useState(defaultRetos);
    const [showEditor, setShowEditor] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        try {
            const savedVerdades = localStorage.getItem(VERDADES_KEY);
            const savedRetos = localStorage.getItem(RETOS_KEY);
            if (savedVerdades) setVerdades(JSON.parse(savedVerdades));
            if (savedRetos) setRetos(JSON.parse(savedRetos));
        } catch (error) {
            console.error('Error loading data:', error);
        }
    };

    const saveData = (newVerdades, newRetos) => {
        try {
            localStorage.setItem(VERDADES_KEY, JSON.stringify(newVerdades));
            localStorage.setItem(RETOS_KEY, JSON.stringify(newRetos));
            setVerdades(newVerdades);
            setRetos(newRetos);
            setShowEditor(false);
        } catch (error) {
            console.error('Error saving data:', error);
        }
    };

    const handleSelection = (type) => {
        const list = type === 'verdad' ? verdades : retos;
        const randomIndex = Math.floor(Math.random() * list.length);
        const text = list[randomIndex];

        setCurrentType(type);
        setCurrentText(text);
        setMode('showing');
    };

    const handleNext = () => {
        if (players.length > 0) {
            setCurrentPlayerIndex((currentPlayerIndex + 1) % players.length);
        }
        setMode('selection');
        setCurrentType(null);
        setCurrentText('');
    };

    const currentPlayer = players.length > 0 ? players[currentPlayerIndex] : null;

    return (
        <Container>
            <Header>
                <IconButton onClick={() => navigate(-1)}>
                    <IoArrowBack size={24} />
                </IconButton>
                <IconButton onClick={() => setShowEditor(true)}>
                    <IoSettingsOutline size={24} />
                </IconButton>
            </Header>

            <VerdadORetoEditor
                visible={showEditor}
                verdades={verdades}
                retos={retos}
                onSave={saveData}
                onCancel={() => setShowEditor(false)}
            />

            <AnimatePresence mode="wait">
                {mode === 'selection' ? (
                    <Content
                        key="selection"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {currentPlayer && (
                            <PlayerIndicator>
                                <PlayerLabel>Turno de:</PlayerLabel>
                                <PlayerName>{currentPlayer.name}</PlayerName>
                            </PlayerIndicator>
                        )}
                        <Title>Elige tu destino</Title>

                        <ButtonsContainer>
                            <ChoiceButton
                                onClick={() => handleSelection('verdad')}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                background="linear-gradient(135deg, #4facfe, #00f2fe)"
                            >
                                <ChoiceIcon>💭</ChoiceIcon>
                                <ChoiceText>VERDAD</ChoiceText>
                            </ChoiceButton>

                            <ChoiceButton
                                onClick={() => handleSelection('reto')}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                background="linear-gradient(135deg, #fa709a, #fee140)"
                            >
                                <ChoiceIcon>🎯</ChoiceIcon>
                                <ChoiceText>RETO</ChoiceText>
                            </ChoiceButton>
                        </ButtonsContainer>
                    </Content>
                ) : (
                    <Content
                        key="showing"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        <TypeIndicator>
                            <TypeText>
                                {currentType === 'verdad' ? '💭 VERDAD' : '🎯 RETO'}
                            </TypeText>
                        </TypeIndicator>

                        <QuestionCard>
                            <MessageText>{currentText}</MessageText>
                        </QuestionCard>

                        <NextButton
                            onClick={handleNext}
                            whileTap={{ scale: 0.98 }}
                        >
                            Siguiente <IoArrowForward />
                        </NextButton>
                    </Content>
                )}
            </AnimatePresence>
        </Container>
    );
}
