import React, { useState } from 'react'
import axios from 'axios'
const Output = (props) => {
    const [output, setoutput] = useState("")
    const runcode=async()=>{
        const res=await axios.post('http://localhost:3000/run',{code:props.code,id:props.id})
        console.log(res.data.stdout)
        setoutput(res.data.stdout || res.data.stderr || res.data.compile_output)
    }
  return (
    <div >
          <div className='bg-gray-700 text-gray-200 text-[18px] px-2 mt-6'>{output}</div>
      <div className='flex justify-end absolute right-5 bottom-5'>
        <button
      onClick={runcode}
      className='bg-amber-100 px-5 py-2 rounded-lg hover:bg-amber-200 cursor-pointer font-semibold tracking-wide'
      >Compile and run</button>
      </div>
    </div>
  )
}

export default Output
