import React from 'react';
import styled from 'styled-components';
import { MIN_AGE } from '../services/profileService';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
`;

const Title = styled.h2`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  margin: 0;
`;

const UpdatedAt = styled.p`
  color: ${({ theme }) => theme.colors.text.disabled};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  margin: 0;
`;

const SectionTitle = styled.h3`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  margin: 0 0 ${({ theme }) => theme.spacing(1)} 0;
`;

const SectionText = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  line-height: 1.5;
  margin: 0;
`;

const Section = ({ title, children }) => (
    <div>
        <SectionTitle>{title}</SectionTitle>
        <SectionText>{children}</SectionText>
    </div>
);

export default function TermsAndConditions() {
    return (
        <Wrapper>
            <div>
                <Title>Términos y condiciones de Previuca</Title>
                <UpdatedAt>Última actualización: 7 de agosto de 2026</UpdatedAt>
            </div>

            <Section title="1. Aceptación">
                Al registrarte en Previuca aceptas estos términos y condiciones en su totalidad.
                Si no estás de acuerdo con alguno de sus puntos, no debes crear una cuenta ni usar la aplicación.
            </Section>

            <Section title={`2. Edad mínima`}>
                Para registrarte debes tener al menos {MIN_AGE} años. Al crear tu cuenta declaras
                que la fecha de nacimiento indicada es real y que cumples este requisito. Nos
                reservamos el derecho de eliminar cualquier cuenta si comprobamos que no lo cumple.
            </Section>

            <Section title="3. Tu cuenta">
                Eres responsable de la confidencialidad de tu contraseña y de toda la actividad
                que ocurra en tu cuenta. El nombre, apellido y fecha de nacimiento indicados en el
                registro no se pueden modificar más adelante; revísalos antes de confirmar.
            </Section>

            <Section title="4. Peñas y contenido que compartes">
                Al crear o unirte a una peña, el nombre, color e imagen que elijas serán visibles
                para el resto de participantes del evento. No está permitido subir contenido
                ofensivo, ilegal o que suplante a terceros; podemos eliminarlo o cerrar la peña si
                incumple esta norma.
            </Section>

            <Section title="5. Flechazo y revelación progresiva de datos">
                La función Flechazo te permite indicar hasta 5 usuarios de Instagram que te gusten.
                Si alguien te indica a ti de la misma forma, coleccionando sellos de otras peñas del
                evento esa persona podrá desbloquear progresivamente algunos de tus datos (género,
                edad y, más adelante, tu peña), y si hay coincidencia mutua se revela el match.
                Al usar esta función aceptas que esta información pueda mostrarse de forma
                progresiva a quienes te hayan añadido a su lista, en los términos descritos en la
                propia aplicación.
            </Section>

            <Section title="6. Juegos y consumo responsable">
                Previuca incluye juegos de fiesta pensados para jugarse en un contexto social, algunos
                de los cuales pueden implicar el consumo de alcohol. La aplicación no fomenta el
                consumo excesivo ni irresponsable: juega con moderación, respeta la normativa local
                sobre venta y consumo de alcohol, y no utilices la app si tú o alguien de tu grupo no
                puede consumir alcohol legalmente. No nos hacemos responsables del uso que hagas de
                los juegos ni de las consecuencias derivadas de un consumo indebido.
            </Section>

            <Section title="7. Conducta prohibida">
                No está permitido acosar, amenazar o suplantar a otros usuarios, ni usar la app con
                fines distintos a los previstos (organizar y disfrutar eventos con tu grupo). Podemos
                suspender o eliminar cuentas que incumplan esta norma.
            </Section>

            <Section title="8. Abandonar un evento o una peña">
                Puedes abandonar un evento en cualquier momento desde tu perfil; al hacerlo se
                eliminará toda tu información relacionada con ese evento (peña, sellos, flechazos)
                como si nunca hubieras participado. También puedes abandonar tu peña sin perder el
                resto de tus datos del evento.
            </Section>

            <Section title="9. Cambios en estos términos">
                Podemos actualizar estos términos si la aplicación cambia. Si los cambios son
                relevantes, te lo indicaremos dentro de la propia app antes de que sigas usándola.
            </Section>

            <Section title="10. Contacto">
                Si tienes dudas sobre estos términos, puedes contactar con el equipo organizador del
                evento a través de los canales habituales del mismo.
            </Section>
        </Wrapper>
    );
}
