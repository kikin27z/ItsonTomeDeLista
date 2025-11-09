interface Props {
    placeholder: string;
    valueInput: string;
    setValue: (value: string) => void;
    nameInput: string;
    typeInput: string;
}

const LoginInput = ({ placeholder, valueInput, setValue, nameInput, typeInput }: Props) => {
    return (
        <input className='login-input' type={typeInput} placeholder={placeholder} name={nameInput} value={valueInput} onChange={(e) => setValue(e.target.value)} />
    )
}

export default LoginInput