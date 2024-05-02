const { createContext, useContext, useState } = require("react")


const MessageContext = createContext();

export const useMessage = () => useContext(MessageContext);

export const MessageProvider = ({ children }) => {
    const [messageInfo, setMessageInfo] = useState({ message: '', type: '' });


    return (
        <MessageContext.Provider value={{ messageInfo, setMessageInfo }}>
            {children}
        </MessageContext.Provider>

    );
}