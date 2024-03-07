
export const Digit = ({className,digit} : any) =>{
    return <div className={className}>
        {!['','1','4'].includes(digit) && <div className={'segment_e'} />}
        {!['','1','2','3','7'].includes(digit) && <div className={'segment_f'} />}
        {!['', '5','6'].includes(digit) && <div className={'segment_h'} />}
        {!['','1','7','0'].includes(digit) && <div className={'segment_j'} />}
        {!['','1','3','4','5','7','9'].includes(digit) && <div className={'segment_k'} />}
        {!['','2'].includes(digit) && <div className={'segment_m'} />}
        {!['','1','4','7'].includes(digit) && <div className={'segment_n'} />}
    </div>
}