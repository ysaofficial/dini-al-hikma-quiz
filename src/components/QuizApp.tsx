
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Trophy, BookOpen, Star, ArrowLeft } from 'lucide-react';
import { quizData, Question, Stage } from '@/data/quizData';
import { useToast } from '@/hooks/use-toast';

const QuizApp = () => {
  const [currentStage, setCurrentStage] = useState<number>(0);
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [completedStages, setCompletedStages] = useState<number[]>([]);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const { toast } = useToast();

  const currentStageData = quizData[currentStage];
  const currentQuestionData = currentStageData?.questions[currentQuestion];
  const totalQuestions = currentStageData?.questions.length || 0;
  const progress = totalQuestions > 0 ? ((currentQuestion + 1) / totalQuestions) * 100 : 0;

  useEffect(() => {
    // Reset when starting new stage
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setIsCorrect(false);
    setShowExplanation(false);
  }, [currentStage]);

  const handleAnswerSelect = (answerIndex: number) => {
    if (isAnswered) return;
    
    setSelectedAnswer(answerIndex);
    setIsAnswered(true);
    
    const correct = answerIndex === currentQuestionData.correctAnswer;
    setIsCorrect(correct);
    setShowExplanation(true);
    
    if (correct) {
      setScore(score + 1);
      toast({
        title: "إجابة صحيحة! 🎉",
        description: "أحسنت، يمكنك الانتقال للسؤال التالي",
        className: "bg-green-50 border-green-200"
      });
    } else {
      toast({
        title: "إجابة خاطئة ❌",
        description: "حاول مرة أخرى، يجب الإجابة بشكل صحيح للمتابعة",
        variant: "destructive"
      });
    }
  };

  const handleNextQuestion = () => {
    if (!isCorrect) {
      toast({
        title: "لا يمكن المتابعة",
        description: "يجب الإجابة الصحيحة أولاً للانتقال للسؤال التالي",
        variant: "destructive"
      });
      return;
    }

    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setIsCorrect(false);
      setShowExplanation(false);
    } else {
      // Stage completed
      setCompletedStages([...completedStages, currentStage]);
      toast({
        title: "تهانينا! 🎊",
        description: `لقد أكملت ${currentStageData.title} بنجاح!`,
        className: "bg-green-50 border-green-200"
      });
    }
  };

  const handleRetryQuestion = () => {
    setSelectedAnswer(null);
    setIsAnswered(false);
    setIsCorrect(false);
    setShowExplanation(false);
  };

  const handleNextStage = () => {
    if (currentStage < quizData.length - 1) {
      setCurrentStage(currentStage + 1);
      setScore(0);
    }
  };

  const handleStageSelect = (stageIndex: number) => {
    if (stageIndex === 0 || completedStages.includes(stageIndex - 1)) {
      setCurrentStage(stageIndex);
      setScore(0);
    } else {
      toast({
        title: "مرحلة مقفلة",
        description: "يجب إكمال المرحلة السابقة أولاً",
        variant: "destructive"
      });
    }
  };

  const handleBackToStages = () => {
    setGameStarted(false);
  };

  const getOptionClassName = (optionIndex: number) => {
    const baseClass = "p-4 text-right border-2 rounded-lg transition-all duration-300 cursor-pointer hover:shadow-md";
    
    if (!isAnswered) {
      return `${baseClass} border-gray-200 hover:border-green-300 hover:bg-green-50`;
    }
    
    if (optionIndex === currentQuestionData.correctAnswer) {
      return `${baseClass} border-green-500 bg-green-100 text-green-800`;
    }
    
    if (optionIndex === selectedAnswer && !isCorrect) {
      return `${baseClass} border-red-500 bg-red-100 text-red-800 animate-shake`;
    }
    
    return `${baseClass} border-gray-200 bg-gray-50 text-gray-500`;
  };

  if (!gameStarted) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-8 animate-bounce-in">
            <div className="flex justify-center mb-4">
              <div className="bg-white p-4 rounded-full shadow-lg">
                <BookOpen className="w-12 h-12 text-green-600" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2 font-amiri">
              اختبار الدين والحكمة
            </h1>
            <p className="text-white/90 text-lg">
              اختبر معلوماتك الدينية عبر مراحل متدرجة
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizData.map((stage, index) => {
              const isLocked = index > 0 && !completedStages.includes(index - 1);
              const isCompleted = completedStages.includes(index);
              
              return (
                <Card 
                  key={stage.id}
                  className={`card-hover cursor-pointer transition-all duration-300 ${
                    isLocked 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'hover:scale-105'
                  } ${
                    isCompleted 
                      ? 'ring-2 ring-green-500 bg-green-50' 
                      : ''
                  }`}
                  onClick={() => {
                    if (!isLocked) {
                      setCurrentStage(index);
                      setGameStarted(true);
                    }
                  }}
                >
                  <CardHeader className="text-center">
                    <div className="flex justify-center mb-2">
                      {isCompleted ? (
                        <Trophy className="w-8 h-8 text-green-600" />
                      ) : isLocked ? (
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                          <span className="text-gray-500 text-sm">🔒</span>
                        </div>
                      ) : (
                        <Star className="w-8 h-8 text-blue-600" />
                      )}
                    </div>
                    <CardTitle className="text-lg font-bold text-gray-800">
                      المرحلة {stage.id}
                    </CardTitle>
                    <h3 className="font-semibold text-gray-700 font-amiri">
                      {stage.title}
                    </h3>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm text-center mb-4">
                      {stage.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <Badge variant="secondary">
                        {stage.questions.length} سؤال
                      </Badge>
                      {isCompleted && (
                        <Badge variant="default" className="bg-green-500">
                          مكتملة ✓
                        </Badge>
                      )}
                      {isLocked && (
                        <Badge variant="destructive">
                          مقفلة
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Quiz interface
  if (currentQuestion >= totalQuestions) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full animate-bounce-in">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Trophy className="w-16 h-16 text-yellow-500" />
            </div>
            <CardTitle className="text-2xl text-green-600 font-amiri">
              تهانينا! أكملت {currentStageData.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="bg-green-50 p-6 rounded-lg">
              <p className="text-lg font-semibold text-green-800 mb-2">
                نتيجتك النهائية
              </p>
              <p className="text-3xl font-bold text-green-600">
                {score} / {totalQuestions}
              </p>
              <p className="text-green-700 mt-2">
                نسبة النجاح: {Math.round((score / totalQuestions) * 100)}%
              </p>
            </div>
            
            <div className="space-y-3">
              <Button 
                onClick={handleBackToStages}
                variant="outline" 
                className="w-full"
              >
                <ArrowLeft className="w-4 h-4 ml-2" />
                العودة للمراحل
              </Button>
              
              {currentStage < quizData.length - 1 && (
                <Button 
                  onClick={handleNextStage}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  المرحلة التالية
                  <ArrowLeft className="w-4 h-4 mr-2 rotate-180" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6 animate-slide-in">
          <div className="flex justify-between items-center mb-4">
            <Button 
              variant="outline" 
              onClick={handleBackToStages}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              العودة للمراحل
            </Button>
            <div className="text-center">
              <h1 className="text-xl font-bold text-gray-800 font-amiri">
                {currentStageData.title}
              </h1>
              <p className="text-gray-600">
                السؤال {currentQuestion + 1} من {totalQuestions}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">النتيجة</p>
              <p className="text-lg font-bold text-green-600">
                {score} / {currentQuestion + (isCorrect ? 1 : 0)}
              </p>
            </div>
          </div>
          
          <Progress value={progress} className="h-3" />
        </div>

        {/* Question Card */}
        <Card className="shadow-lg animate-slide-in">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-800 leading-relaxed font-amiri">
              {currentQuestionData.question}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Options */}
            <div className="space-y-3">
              {currentQuestionData.options.map((option, index) => (
                <div
                  key={index}
                  className={getOptionClassName(index)}
                  onClick={() => handleAnswerSelect(index)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {isAnswered && index === currentQuestionData.correctAnswer && (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      )}
                      {isAnswered && index === selectedAnswer && !isCorrect && (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                    <span className="text-lg font-medium">{option}</span>
                    <span className="text-sm font-bold bg-gray-100 px-2 py-1 rounded">
                      {['أ', 'ب', 'ج', 'د'][index]}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Explanation */}
            {showExplanation && currentQuestionData.explanation && (
              <div className={`p-4 rounded-lg border-2 animate-slide-in ${
                isCorrect 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-blue-50 border-blue-200'
              }`}>
                <h4 className="font-semibold mb-2 text-gray-800">
                  {isCorrect ? '✅ إجابة صحيحة!' : '💡 التفسير:'}
                </h4>
                <p className="text-gray-700 leading-relaxed">
                  {currentQuestionData.explanation}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              {isAnswered && isCorrect && (
                <Button 
                  onClick={handleNextQuestion}
                  className="flex-1 bg-green-600 hover:bg-green-700 animate-pulse-success"
                >
                  {currentQuestion < totalQuestions - 1 ? 'السؤال التالي' : 'إنهاء المرحلة'}
                  <ArrowLeft className="w-4 h-4 mr-2 rotate-180" />
                </Button>
              )}
              
              {isAnswered && !isCorrect && (
                <Button 
                  onClick={handleRetryQuestion}
                  variant="outline"
                  className="flex-1 border-orange-300 text-orange-600 hover:bg-orange-50"
                >
                  حاول مرة أخرى
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QuizApp;
