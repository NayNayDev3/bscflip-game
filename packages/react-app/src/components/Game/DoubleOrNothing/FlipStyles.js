import styled from "styled-components";

export const FlipContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
`;

export const GameButton = styled.button`
    height: 50px;
    width: ${props => !props.wide ? "125px" : "250px"};
    background-color: ${props => props.isActive ? "#F1B913" : "#27292D"};
    border: 1px solid #545659;
    border-radius: ${props => !props.wide ? "20% / 50%" : "10% / 50%"};
    color: white;
    cursor: ${props => !props.isDisabled ? "pointer" : "not-allowed"};
    font-size: 1vw;
    text-align: center;
    text-decoration: none;
    margin: 0px 5px;
    padding: 12px 24px;
    opacity: ${props => !props.isDisabled ? 1 : 0.5};

  ${props => props.hidden && "hidden"} :focus {
    border: none;
    outline: none;
  }

  ${props => !props.isDisabled && ":hover" } {
    background-color: ${props => props.isActive ? "#F1B213" : "#2F3236"};
    opacity: 0.8;
  }
`;