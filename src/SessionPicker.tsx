import React from 'react';

export interface Props {
    code: string
};

export const SessionPicker = ({code}: Props) => {
    return <>
        <div className="title is-5 is-no-wrap">{code.split('_')[0]}</div>
        <div className="field is-horizontal ">
            <div className="field-label is-normal">
                <label className="label">LEC1</label>
            </div>
            <div className="field-body"><div className="field is-narrow">
                <div className="control"><div className="select">
                    <select className="select"><option>01</option></select>
                </div></div>
            </div></div>
        </div>
        <div className="field is-horizontal ">
            <div className="field-label is-normal">
                <label className="label">LEC2</label>
            </div>
            <div className="field-body"><div className="field is-narrow">
                <div className="control"><div className="select">
                    <select className="select"><option>01</option></select>
                </div></div>
            </div></div>
        </div>
    </>;
}