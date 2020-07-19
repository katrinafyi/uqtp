import React, { memo } from 'react';
import { FaFileUpload } from 'react-icons/fa';

export interface Props extends React.HTMLAttributes<HTMLDivElement>{
    fileName?: string,
    setFile: (f: File) => any,
}

export const FileInput = ({setFile, fileName, ...other}: Props) => {

    const onChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
        setFile(ev.target.files![0]);
    };

    other.className = (other.className || '') + " file";

    return <div {...other}>
        <label className="file-label">
            <input className="file-input" type="file" onChange={onChange} 
                accept=".xls"/>
            <span className="file-cta">
                <span className="file-icon">
                    <FaFileUpload></FaFileUpload>
                </span>
                <span className="file-label">
                    Browse...
                </span>
            </span>
            {/* <span className="file-name">
                {!fileName ? "(none)" : fileName}
            </span> */}
        </label>
    </div>;
};

export default memo(FileInput);