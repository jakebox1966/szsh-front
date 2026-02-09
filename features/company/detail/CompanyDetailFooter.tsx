export function CompanyDetailFooter() {
  return (
    <footer className="w-full py-10 text-center border-t border-gray-100 bg-white">
      <div className="flex items-center justify-center gap-2 mb-4 opacity-50">
        <span className="text-lg font-bold tracking-tight">szsh.ai</span>
      </div>
      <p className="text-gray-400 text-xs">
        본 페이지의 데이터는 공공데이터포털, 국민연금공단 등 공시 자료와 자체 AI 예측 모델을
        기반으로 작성되었습니다.
        <br />
        실제 기업 내부 정보와 차이가 있을 수 있으며, 법적 효력은 없습니다.
      </p>
    </footer>
  );
}
