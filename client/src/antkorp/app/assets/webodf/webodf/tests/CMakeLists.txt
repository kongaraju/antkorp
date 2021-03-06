# prepare

FILE( GLOB_RECURSE TESTS_TESTFILES RELATIVE ${CMAKE_CURRENT_SOURCE_DIR}
	${CMAKE_CURRENT_SOURCE_DIR}/manifest.js
	${CMAKE_CURRENT_SOURCE_DIR}/tests.js
	${CMAKE_CURRENT_SOURCE_DIR}/tests.html
	${CMAKE_CURRENT_SOURCE_DIR}/*/*
   	)

COPY_FILES(tests_nodetests ${CMAKE_CURRENT_SOURCE_DIR}
	${CMAKE_CURRENT_BINARY_DIR}/_nodetest ${TESTS_TESTFILES} )
add_custom_target(nodetest ALL
	COMMAND ${NODE} ${RUNTIME} ./tests.js
	WORKING_DIRECTORY _nodetest
    DEPENDS NodeJS ${tests_nodetests} jslintcheck
)

if (QT4_FOUND)
	COPY_FILES(tests_qtjsruntimetest ${CMAKE_CURRENT_SOURCE_DIR}
		${CMAKE_CURRENT_BINARY_DIR}/_qtjsruntimetest ${TESTS_TESTFILES} )
	add_custom_target(qtjsruntimetest ALL
		COMMAND ${CMAKE_BINARY_DIR}/programs/qtjsruntime/qtjsruntime ${RUNTIME} ./tests.js
		WORKING_DIRECTORY _qtjsruntimetest
		DEPENDS NodeJS ${tests_qtjsruntimetest} qtjsruntime jslintcheck
	)
endif (QT4_FOUND)

