import React from 'react';
import { useCountdown } from '../../hooks/useCountdown';
import { Card, CardContent } from '../ui/card';
import { Clock } from 'lucide-react';

const CountdownTimer = ({ endTime, onComplete, label }) => {
  const timeLeft = useCountdown(endTime, onComplete);

  if (timeLeft.total <= 0) {
    return (
      <Card className="border-gray-300 bg-gray-50">
        <CardContent className="flex items-center justify-center gap-3 p-5">
          <div className="flex items-center justify-center rounded-full bg-white p-2.5">
            <Clock className="h-5 w-5 text-gray-600" />
          </div>
          <p className="text-sm font-medium leading-none text-gray-900">Phase ended</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-gray-300 bg-white">
      <CardContent className="p-8">
        <p className="mb-6 text-center text-sm font-medium leading-relaxed text-gray-600">{label}</p>
        <div className="flex items-center justify-center gap-4">
          <TimeUnit value={timeLeft.hours} label="Hours" />
          <span className="text-3xl font-light leading-none text-gray-400">:</span>
          <TimeUnit value={timeLeft.minutes} label="Minutes" />
          <span className="text-3xl font-light leading-none text-gray-400">:</span>
          <TimeUnit value={timeLeft.seconds} label="Seconds" />
        </div>
      </CardContent>
    </Card>
  );
};

const TimeUnit = ({ value, label }) => (
  <div className="flex flex-col items-center">
    <div className="flex items-center justify-center rounded-3xl border-2 border-gray-300 bg-gray-50 px-5 py-4 shadow-sm">
      <span className="text-4xl font-semibold leading-none tabular-nums text-black">
        {String(value).padStart(2, '0')}
      </span>
    </div>
    <p className="mt-3 text-xs font-medium uppercase leading-none tracking-wider text-gray-600">
      {label}
    </p>
  </div>
);

export default CountdownTimer;
