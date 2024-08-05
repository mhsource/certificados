package com.example.demo;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.mapstruct.factory.Mappers;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;


@SpringBootApplication
public class DemoApplication {
	public static void main(String[] args) {

		//SpringApplication.run(DemoApplication.class, args);

		String jsonString = "{"
				+ "\"idConta\":\"ddddddffggda\","
				+ "\"contrato\":{\"id\":\"1\"},"
				+ "\"contas\":["
				+ "{\"agencia\":\"111\",\"conta\":\"22\",\"dac\":\"1\"},"
				+ "{\"agencia\":\"111\",\"conta\":\"22\",\"dac\":\"1\"}"
				+ "]"
				+ "}";

		ObjectMapper objectMapper = new ObjectMapper();
		try {
			// Desserialização do JSON para InputData
			InputData inputData = objectMapper.readValue(jsonString, InputData.class);

			// Obtenção do mapper e transformação de InputData para OutputData
			DataMapper mapper = Mappers.getMapper(DataMapper.class);
			List<OutputData> outputDataList = mapper.toOutputDataList(inputData);

			// Impressão do resultado da transformação
			System.out.println("Transformação de InputData para OutputData:");
			outputDataList.forEach(System.out::println);

			// Transformação de volta de OutputData para InputData
			InputData transformedBackInputData = mapper.toInputData(outputDataList);

			// Impressão do resultado da transformação inversa
			System.out.println("\nTransformação de volta de OutputData para InputData:");
			System.out.println(transformedBackInputData);

		} catch (IOException e) {
			e.printStackTrace();
		}
	}
}

@Mapper
interface DataMapper {

	@Mapping(target = "idTest", expression = "java(inputData.getIdConta().substring(0, 6))")
	@Mapping(target = "idCont", expression = "java(inputData.getIdConta().substring(6, 9))")
	@Mapping(target = "dig", expression = "java(inputData.getIdConta().substring(9))")
	@Mapping(target = "contratoId", expression = "java(inputData.getContrato().getId())")
	@Mapping(source = "conta.agencia", target = "agencia")
	@Mapping(source = "conta.conta", target = "conta")
	@Mapping(source = "conta.dac", target = "dac")
	OutputData toOutputData(InputData inputData, Conta conta);

	// Método para mapear de OutputData para Conta
	@Mapping(target = "agencia", source = "outputData.agencia")
	@Mapping(target = "conta", source = "outputData.conta")
	@Mapping(target = "dac", source = "outputData.dac")
	Conta toConta(OutputData outputData);

	default List<OutputData> toOutputDataList(InputData inputData) {
		return inputData.getContas().stream()
				.map(conta -> toOutputData(inputData, conta))
				.collect(Collectors.toList());
	}

	// Método para mapear de OutputData para InputData
	default InputData toInputData(List<OutputData> outputDataList) {
		if (outputDataList == null || outputDataList.isEmpty()) {
			return null;
		}

		OutputData firstOutput = outputDataList.get(0);
		InputData inputData = new InputData();
		String idConta = firstOutput.getIdTest() + firstOutput.getIdCont() + firstOutput.getDig();
		inputData.setIdConta(idConta);

		Contrato contrato = new Contrato();
		contrato.setId(firstOutput.getContratoId());
		inputData.setContrato(contrato);

		List<Conta> contas = outputDataList.stream()
				.map(this::toConta)
				.collect(Collectors.toList());
		inputData.setContas(contas);

		return inputData;
	}
}

class Conta {
	private String agencia;
	private String conta;
	private String dac;

	public String getAgencia() {
		return agencia;
	}

	public void setAgencia(String agencia) {
		this.agencia = agencia;
	}

	public String getConta() {
		return conta;
	}

	public void setConta(String conta) {
		this.conta = conta;
	}

	public String getDac() {
		return dac;
	}

	public void setDac(String dac) {
		this.dac = dac;
	}

	@Override
	public String toString() {
		return "Conta{" +
				"agencia='" + agencia + '\'' +
				", conta='" + conta + '\'' +
				", dac='" + dac + '\'' +
				'}';
	}
}

class Contrato {
	private String id;

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	@Override
	public String toString() {
		return "Contrato{" +
				"id='" + id + '\'' +
				'}';
	}
}

class InputData {
	private String idConta;
	private Contrato contrato;
	private List<Conta> contas;

	public String getIdConta() {
		return idConta;
	}

	public void setIdConta(String idConta) {
		this.idConta = idConta;
	}

	public Contrato getContrato() {
		return contrato;
	}

	public void setContrato(Contrato contrato) {
		this.contrato = contrato;
	}

	public List<Conta> getContas() {
		return contas;
	}

	public void setContas(List<Conta> contas) {
		this.contas = contas;
	}

	@Override
	public String toString() {
		return "InputData{" +
				"idConta='" + idConta + '\'' +
				", contrato=" + contrato +
				", contas=" + contas +
				'}';
	}
}

class OutputData {
	private String idTest;
	private String idCont;
	private String dig;
	private String contratoId;
	private String agencia;
	private String conta;
	private String dac;

	public String getIdTest() {
		return idTest;
	}

	public void setIdTest(String idTest) {
		this.idTest = idTest;
	}

	public String getIdCont() {
		return idCont;
	}

	public void setIdCont(String idCont) {
		this.idCont = idCont;
	}

	public String getDig() {
		return dig;
	}

	public void setDig(String dig) {
		this.dig = dig;
	}

	public String getContratoId() {
		return contratoId;
	}

	public void setContratoId(String contratoId) {
		this.contratoId = contratoId;
	}

	public String getAgencia() {
		return agencia;
	}

	public void setAgencia(String agencia) {
		this.agencia = agencia;
	}

	public String getConta() {
		return conta;
	}

	public void setConta(String conta) {
		this.conta = conta;
	}

	public String getDac() {
		return dac;
	}

	public void setDac(String dac) {
		this.dac = dac;
	}

	@Override
	public String toString() {
		return "OutputData{" +
				"idTest='" + idTest + '\'' +
				", idCont='" + idCont + '\'' +
				", dig='" + dig + '\'' +
				", contratoId='" + contratoId + '\'' +
				", agencia='" + agencia + '\'' +
				", conta='" + conta + '\'' +
				", dac='" + dac + '\'' +
				'}';
	}
}

