import React, { useEffect, useState } from 'react'
import Select from 'react-select'
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';




function App (){

    const [rawData, setRawData] = useState();
    const [worldCalc, setWorldCalc] = useState()
    const [chartData, setChartData] = useState({
        line1: 'Israel ',
        line2: 'China (Anhui)'
    });
    const [selectOptions, setSelectOptions] = useState([])
    

    useEffect(() => {   
        fetch('https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv')
        .then(res => res.text())
        .then(res => {
            let splited = res.split('\n')
            splited = splited.map(row => row.split(','))
            splited.pop()
            const data = []
            for(let country = 1; country < splited.length; country++){
                if((/[^0-9]/g).test(splited[country][4])){
                    splited[country] = [splited[country][0], `${splited[country][1]},${splited[country][2]}`, ...splited[country].slice(3)]
                }
            }
            for(let day = 4; day < splited[0].length; day++){
                const dayData={}
                for(let country = 1; country < splited.length; country++){
                    if(/[^0-9]/g.test())
                    dayData[`${splited[country][1]} ${splited[country][0] ? `(${splited[country][0]})` : ''}`] = splited[country][day]
                }
                data.push({
                    date: splited[0][day],
                    ...dayData
                })
            }
            setRawData(data)

            const worldCount = data.map(day => {
                const sum = Object.keys(day).reduce((sum, country) => {
                    if(country === 'date'){
                        return sum
                    } else {
                        return sum +  parseInt(day[country])
                    }
                }, 0)
                return {
                    date: day.date,
                    sum: sum
                }
            })

            setWorldCalc(worldCount)

            const countries = Object.keys(data[0]).slice(1).map(country => {
                return {
                    value: country,
                    label: country
                }
            })
            setSelectOptions(countries)
        }) 
    }, [])

    const handleChange = React.useCallback((line, country) => {
        setChartData({
            ...chartData,
            [line]: country
        })
        
    }, [chartData])

    const getMax = React.useCallback(() => {
        if(rawData){
            const values = rawData.map(day => [Math.floor(parseInt(day[chartData.line1])), Math.floor(parseInt(day[chartData.line2]))]).flat()
             const max = Math.max(...values) + 10000 + (1000 - Math.max(...values) % 1000)
             return max
        }
            
    }, [chartData])

    getMax()
    return(
        <>
            {rawData && <div>
                <LineChart width={730} height={500} data={rawData}
                    margin={{ top: 50, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date"/>
                    <YAxis type='number' allowDataOverflow={true}domain={[0, getMax() || 1000000]}/>
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey={chartData.line1} stroke="#8884d8" />
                    <Line type="monotone" dataKey={chartData.line2} stroke="#82ca9d" />
                </LineChart>
            </div>}
            <div style={{width: "500px", marginLeft: "50px"}}>
                <Select options={selectOptions} onChange={(e) => handleChange('line1', e.value)}/> 
                <Select options={selectOptions} onChange={(e) => handleChange('line2', e.value)}/> 
            </div>
            {worldCalc && <div>
                <LineChart width={730} height={500} data={worldCalc}
                    margin={{ top: 50, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date"/>
                    <YAxis type='number' allowDataOverflow={true}domain={[0,worldCalc[worldCalc.length - 1].sum]}/>
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" name={'World Total Cases'} dataKey={'sum'} stroke="#8884d8" />
                </LineChart>
            </div>}
        </>
    )
}

export default App